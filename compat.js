export function macCompat() {
  return (code, window, dir) => {
    if (
      window.navigator.platform.indexOf('Mac') === 0 &&
      code.indexOf('meta+ctrl') === -1
    ) {
      return code.replace(...(dir ? ['ctrl', 'meta'] : ['meta', 'ctrl']))
    }
    return code
  }
}
