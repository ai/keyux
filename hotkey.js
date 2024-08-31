let NON_ENGLISH_LAYOUT = /^[^\x00-\x7F]$/

let IGNORE_INPUTS = {
  checkbox: true,
  file: true,
  radio: true
}

let CLICK_INPUTS = {
  button: true,
  reset: true,
  submit: true
}

let KEY_REPLACERS = {
  ' ': 'space',
  '+': 'plus'
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
  code += KEY_REPLACERS[event.key] ?? event.key.toLowerCase()

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
      if (
        !event.altKey &&
        (event.target.tagName === 'TEXTAREA' ||
          (event.target.tagName === 'INPUT' &&
            !IGNORE_INPUTS[event.target.type]) ||
          event.target.role === 'menuitem')
      ) {
        return
      }
      let active = findHotKey(event, window, transformers)
      if (!active) return
      if (
        active.tagName === 'TEXTAREA' ||
        (active.tagName === 'INPUT' && !CLICK_INPUTS[active.type])
      ) {
        setTimeout(() => {
          active.focus()
        })
      } else {
        active.click()
      }
    }

    window.addEventListener('keydown', keyDown)
    return () => {
      window.removeEventListener('keydown', keyDown)
    }
  }
}
