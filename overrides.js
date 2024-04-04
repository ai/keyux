export function overrides(config) {
  return code => {
    let realCode = config[code]
    if (Object.values(config).includes(code) && !realCode) return false
    return realCode || code
  }
}

export function hintOverrides(config) {
  return code => {
    for (let i in config) {
      if (config[i] === code) {
        return i
      }
    }
    return code
  }
}
