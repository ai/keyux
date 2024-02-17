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
  let pretty = realCode
    .split('+')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' + ')
  if (window.navigator.platform.indexOf('Mac') === 0) {
    return pretty
      .replace('Meta', '⌘')
      .replace('Ctrl', '⌃')
      .replace('Alt', '⌥')
      .replace('Shift', '⇧')
  } else {
    return pretty
  }
}
