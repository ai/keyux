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

function choseTheElement(list, current) {
  let arr = [...list];
  
  for (let j = 0; j < arr.length;) {
    let element = arr[j];
    
    while (true) {
      if (
        element.parentElement === current ||
        element.parentElement == null
      ) {
        return arr[j]
      }
      if (
        element.parentElement.hasAttribute(IGNORE_ATTR) &&
        !element.parentElement.hasAttribute(NOT_IGNOR_ATTR)
      ) {
        j++
        break
      } else {
        element = element.parentElement
      }
    }
  }

  return null;
}

function checkHotkey(where, code, overrides) {
  let codeOverride = overrides[code]
  if (Object.values(overrides).includes(code) && !codeOverride) return false
  let current = where.activeElement;
  let list = current.querySelectorAll(`[aria-keyshortcuts="${codeOverride || code}" i]`)
  let elementWithHotKey = null;

  elementWithHotKey = choseTheElement(list, current)

  if (current.hasAttribute(NOT_IGNOR_ATTR)) {
    return choseTheElement(list, current)
  }

  if (elementWithHotKey == null) {
    list = where.querySelectorAll(`[aria-keyshortcuts="${codeOverride || code}" i]`)
    return choseTheElement(list, where)
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
