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
