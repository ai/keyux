export function hotkeyOverrides(overrides) {
  return [
    code => {
      let realCode = overrides[code]
      if (!realCode && Object.values(overrides).includes(code)) return false
      return realCode || code
    },

    code => {
      for (let i in overrides) {
        if (overrides[i] === code) {
          return i
        }
      }
      return code
    }
  ]
}
