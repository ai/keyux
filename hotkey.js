const NON_ENGLISH_LAYOUT = /^[^\x00-\x7F]$/

const IGNORE_INPUTS = {
  checkbox: true,
  file: true,
  radio: true
}

function ignoreHotkeysIn(target) {
  return (
    target.tagName === 'TEXTAREA' ||
    (target.tagName === 'INPUT' && !IGNORE_INPUTS[target.type]) ||
    target.role === 'menuitem'
  )
}

function isElementIsIgnoredInRange(parent, node) {
  if (node.tagName === 'BODY') return null
  if (parent === node) return null
  if (node.hasAttribute('data-keyux-ignore-hotkeys')) return node

  return isElementIsIgnoredInRange(parent, node.parentNode)
}

function getActiveElementInRange(activeElement, elements, container) {
  for (let element of elements) {
    let ignoreElement = isElementIsIgnoredInRange(activeElement, element)

    if (ignoreElement) continue

    if (activeElement.hasAttribute('data-keyux-hotkeys')) {
      let id = activeElement.getAttribute('data-keyux-hotkeys')

      if (id) return container.getElementById(id)
    }

    return element
  }

  return null
}

function getFocusedElement(where, code) {
  return getActiveElementInRange(
    where.activeElement,
    where.activeElement.querySelectorAll(`[aria-keyshortcuts="${code}" i]`),
    where
  )
}

function checkHotkey(where, code, overrides) {
  let codeOverride = overrides[code]
  if (Object.values(overrides).includes(code) && !codeOverride) return false
  return getFocusedElement(where, codeOverride || code)
}

function findHotKey(event, where, overrides) {
  let prefix = ''
  if (event.metaKey) prefix += 'meta+'
  if (event.ctrlKey) prefix += 'ctrl+'
  if (event.altKey) prefix += 'alt+'
  if (event.shiftKey) prefix += 'shift+'

  let code = prefix
  if (event.key === '+') {
    code += 'plus'
  } else {
    code += event.key.toLowerCase()
  }

  let hotkey = checkHotkey(where, code, overrides)
  if (
    !hotkey &&
    NON_ENGLISH_LAYOUT.test(event.key) &&
    /^Key.$/.test(event.code)
  ) {
    let enKey = event.code.replace(/^Key/, '').toLowerCase()
    hotkey = checkHotkey(where, prefix + enKey, overrides)
  }

  return hotkey
}

export function hotkeyKeyUX(overrides = {}) {
  return window => {
    function keyDown(event) {
      if (ignoreHotkeysIn(event.target)) return
      let press = findHotKey(event, window.document, overrides)
      if (press) press.click()
    }

    window.addEventListener('keydown', keyDown)
    return () => {
      window.removeEventListener('keydown', keyDown)
    }
  }
}
