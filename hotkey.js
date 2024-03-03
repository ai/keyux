const NON_ENGLISH_LAYOUT = /^[^\x00-\x7F]$/
const IGNORE_ATTR = 'data-keyux-ignore-hotkeys'
const NOT_IGNOR_ATTR = 'data-keyux-hotkeys'

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

  for (let j = 0; j < list.length; j++) {
    let closestElement = list[j].closest(`[${IGNORE_ATTR}]`)
    if (closestElement === current || closestElement == null) {
      return list[j]
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
  
  
  if(choseTheElement(current, cssSelector) != null) {
    elementWithHotKey = choseTheElement(current, cssSelector)
  } else {
    elementWithHotKey = choseTheElement(where, cssSelector)
  }

  if (current.hasAttribute(IGNORE_ATTR) && !current.hasAttribute(NOT_IGNOR_ATTR)) {
    elementWithHotKey = choseTheElement(current, cssSelector)
  }

  if (current.hasAttribute(NOT_IGNOR_ATTR)) {
    let id = current.getAttribute(NOT_IGNOR_ATTR)
    let newCurrent = where.getElementById(id)
    elementWithHotKey = choseTheElement(newCurrent, cssSelector)
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
