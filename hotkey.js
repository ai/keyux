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

function getKeyShortCutsSelector(code) {
  return `[aria-keyshortcuts="${code}" i]`
}

function findUpTheFirstListElement(node) {
    if(node.tagName === 'BODY') return null;
    if(node.tagName === 'LI') return node;

    return findUpTheFirstListElement(node.parentNode);
}

function getFocusedElement(where, code) {
  let activeElement = where.activeElement

  let element = activeElement.querySelector(getKeyShortCutsSelector(code))

  if(element) return element;

  if(activeElement.getAttribute('aria-keyshortcuts') === code) {
    element = activeElement;
  } else {
    let validLi = findUpTheFirstListElement(where.activeElement)
    if(validLi !== null) element = validLi
  }

  return element || where.querySelector(getKeyShortCutsSelector(code))
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
