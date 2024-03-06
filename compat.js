const MAC_COMPAT_KEY = Symbol('macCompat')
export const MAC_COMPAT = { [MAC_COMPAT_KEY]: true }

export function applyCompat(code, window, overrides, dir = 'forward') {
  if (
    overrides[MAC_COMPAT_KEY] &&
    window.navigator.platform.indexOf('Mac') === 0 &&
    code.indexOf('meta+ctrl') === -1
  ) {
    return code.replace(
      ...(dir === 'reverse' ? ['ctrl', 'meta'] : ['meta', 'ctrl'])
    )
  }
  return code
}
