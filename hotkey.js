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

function choseTheElement(current, selector) {
  let list = current.querySelectorAll(selector)

  for (let el of list) {
    let closestElement = el.closest('data-keyux-ignore-hotkeys')
    if (closestElement === current || !closestElement) {
      return el
    }
  }
  return null
}

function checkHotkey(where, code, overrides) {
  let codeOverride = overrides[code]
  if (Object.values(overrides).includes(code) && !codeOverride) return false
  let current = where.activeElement
  let cssSelector = `[aria-keyshortcuts="${codeOverride || code}" i]`
  let elementWithHotKey = null

  if (current.hasAttribute('data-keyux-hotkeys')) {
    let id = current.getAttribute('data-keyux-hotkeys')
    let newCurrent = where.getElementById(id)
    elementWithHotKey = choseTheElement(newCurrent, cssSelector)
  } else if (
    current.hasAttribute('data-keyux-ignore-hotkeys') &&
    !current.hasAttribute('data-keyux-hotkeys')
  ) {
    elementWithHotKey = choseTheElement(current, cssSelector)
  } else {
    elementWithHotKey = choseTheElement(where, cssSelector)
  }

  return elementWithHotKey
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
