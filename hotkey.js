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

function isInsideIgnored(parent, node) {
  if (node.tagName !== 'BODY' && parent !== node) {
    if (node.hasAttribute('data-keyux-ignore-hotkeys')) {
      return true
    } else {
      return isInsideIgnored(parent, node.parentNode)
    }
  }
}

function findNonIgnored(activeElement, elements) {
  for (let element of elements) {
    if (isInsideIgnored(activeElement, element)) continue
    return element
  }
}

function checkHotkey(where, code, overrides) {
  let codeOverride = overrides[code]
  if (Object.values(overrides).includes(code) && !codeOverride) return false

  let activeElement = where.activeElement
  let actualCode = codeOverride || code

  let areaId = activeElement.getAttribute('data-keyux-hotkeys')
  if (areaId) {
    let area = where.querySelector(`#${areaId}`)
    if (area) {
      let element = area.querySelector(`[aria-keyshortcuts="${actualCode}" i]`)
      if (element) return element
    }
  }

  return (
    findNonIgnored(
      activeElement,
      activeElement.querySelectorAll(`[aria-keyshortcuts="${actualCode}" i]`)
    ) ||
    findNonIgnored(
      where,
      where.querySelectorAll(`[aria-keyshortcuts="${actualCode}" i]`)
    )
  )
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
