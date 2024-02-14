const NON_ENGLISH_LAYOUT = /^[^\x00-\x7F]$/

function ignoreHotkeysIn(target) {
  return target.tagName === 'TEXTAREA' || target.tagName === 'INPUT'
}

function findHotKey(event, where) {
  let prefix = ''
  if (event.metaKey) prefix += 'meta+'
  if (event.ctrlKey) prefix += 'ctrl+'
  if (event.shiftKey) prefix += 'shift+'
  if (event.altKey) prefix += 'alt+'

  let code = prefix
  if (event.key === '+') {
    code += 'plus'
  } else {
    code += event.key.toLowerCase()
  }

  let hotkey = where.querySelector(`[aria-keyshortcuts="${code}" i]`)
  if (
    !hotkey &&
    NON_ENGLISH_LAYOUT.test(event.key) &&
    /^Key.$/.test(event.code)
  ) {
    let enKey = event.code.replace(/^Key/, '').toLowerCase()
    let enCode = prefix + enKey
    hotkey = where.querySelector(`[aria-keyshortcuts="${enCode}" i]`)
  }

  return hotkey
}

export function hotkeysKeyUX() {
  return window => {
    function keyDown(event) {
      if (ignoreHotkeysIn(event.target)) return
      let press = findHotKey(event, window.document)
      if (press) press.click()
    }

    window.addEventListener('keydown', keyDown)
    return () => {
      window.removeEventListener('keydown', keyDown)
    }
  }
}
