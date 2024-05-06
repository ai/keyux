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

function checkHotkey(window, code, transformers) {
  let realCode = code
  for (let [transform] of transformers) {
    realCode = transform(realCode, window)
    if (!realCode) return false
  }

  let where = window.document
  let activeElement = where.activeElement

  let areaId = activeElement.getAttribute('data-keyux-hotkeys')
  if (areaId) {
    let area = where.querySelector(`#${areaId}`)
    if (area) {
      let element = area.querySelector(`[aria-keyshortcuts="${realCode}" i]`)
      if (element) return element
    }
  }

  return (
    findNonIgnored(
      activeElement,
      activeElement.querySelectorAll(`[aria-keyshortcuts="${realCode}" i]`)
    ) ||
    findNonIgnored(
      where,
      where.querySelectorAll(`[aria-keyshortcuts="${realCode}" i]`)
    )
  )
}

function findHotKey(event, window, transformers) {
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

  let hotkey = checkHotkey(window, code, transformers)
  if (
    !hotkey &&
    NON_ENGLISH_LAYOUT.test(event.key) &&
    /^Key.$/.test(event.code)
  ) {
    let enKey = event.code.replace(/^Key/, '').toLowerCase()
    hotkey = checkHotkey(window, prefix + enKey, transformers)
  }

  return hotkey
}

export function hotkeyKeyUX(transformers = []) {
  return window => {
    function keyDown(event) {
      if (!event.altKey && ignoreHotkeysIn(event.target)) return
      let press = findHotKey(event, window, transformers)
      if (press) press.click()
    }

    window.addEventListener('keydown', keyDown)
    return () => {
      window.removeEventListener('keydown', keyDown)
    }
  }
}
