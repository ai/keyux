export * from './hotkeys.js'
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
