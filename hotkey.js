const NON_ENGLISH_LAYOUT = /^[^\x00-\x7F]$/

const IGNORE_INPUTS = {
  checkbox: true,
  file: true,
  radio: true
}

const IGNORE_HOTKEYS_ATTR = 'data-keyux-ignore-hotkeys'
const HOTKEYS_ATTR = 'data-keyux-hotkeys'

function getKeyShortCutsSelector(code) {
  return `[aria-keyshortcuts="${code}" i]`
}

function ignoreHotkeysIn(target) {
  return (
    target.tagName === 'TEXTAREA' ||
    (target.tagName === 'INPUT' && !IGNORE_INPUTS[target.type]) ||
    target.role === 'menuitem'
  )
}

function findUpFirstIgnoredElement(node) {
    if(node.tagName === 'BODY') return null;
    if(node.hasAttribute(IGNORE_HOTKEYS_ATTR)) return node;

    return findUpFirstIgnoredElement(node.parentNode);
}

function getEnabledSelector(elements) {
  for(let element of elements) {
    let ignored = findUpFirstIgnoredElement(element)

    if(!ignored) return element;

    if(ignored.getAttribute(HOTKEYS_ATTR) === ignored.id) {
      return element
    }
  }

  return null;
}

function getFocusedElement(where, code) {
  let activeElement = where.activeElement;

  return getEnabledSelector(Array.from(activeElement.querySelectorAll(getKeyShortCutsSelector(code)))) ||
  getEnabledSelector(Array.from(where.querySelectorAll(getKeyShortCutsSelector(code))))
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
