function maybeApplyCompat(code, window, from, to) {
  if (
    window.navigator.platform.indexOf('Mac') === 0 &&
    !code.includes('meta+ctrl')
  ) {
    return code.replace(from, to)
  }
  return code
}

export function hotkeyMacCompat() {
  return [
    (code, window) => maybeApplyCompat(code, window, 'meta', 'ctrl'),
    (code, window) => maybeApplyCompat(code, window, 'ctrl', 'meta')
  ]
}
