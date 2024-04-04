export function hotkeyOverrides(overrides) {
  return (code, window, dir) => {
    if (dir === 'r') {
      for (let i in overrides) {
        if (overrides[i] === code) {
          return i
        }
      }
      return code
    }

    let realCode = overrides[code]
    if (Object.values(overrides).includes(code) && !realCode) return false
    return realCode || code
  }
}
