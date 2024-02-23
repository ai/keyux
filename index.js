export * from './hotkey.js'
export * from './hidden.js'
export * from './press.js'
export * from './menu.js'
export * from './jump.js'

export function startKeyUX(window, plugins) {
  let unbinds = plugins.map(plugin => plugin(window))
  return () => {
    unbinds.forEach(unbind => unbind())
  }
}

export function likelyWithKeyboard(window = globalThis) {
  let agent = window.navigator.userAgent.toLowerCase()
  return !['iphone', 'ipad', 'android'].some(device => agent.includes(device))
}

export function getHotKeyHint(window, code, overrides = {}) {
  let realCode = code
  for (let i in overrides) {
    if (overrides[i] === code) {
      realCode = i
      break
    }
  }
  let prettyParts = realCode
    .split('+')
    .map(part => part[0].toUpperCase() + part.slice(1))
  if (window.navigator.platform.indexOf('Mac') === 0) {
    return sortMacKeys(prettyParts)
      .join(' ')
      .replace('Meta', '⌘')
      .replace('Ctrl', '⌃')
      .replace('Alt', '⌥')
      .replace('Shift', '⇧')
  } else {
    return prettyParts.join(' + ')
  }
}

function sortMacKeys(keys) {
  let keyOrder = ['Ctrl', 'Alt', 'Shift', 'Meta']
  return keys.sort((a, b) => {
    let aIndex = keyOrder.indexOf(a)
    let bIndex = keyOrder.indexOf(b)
    return (
      (aIndex >= 0 ? aIndex : keyOrder.length) -
      (bIndex >= 0 ? bIndex : keyOrder.length)
    )
  })
}
