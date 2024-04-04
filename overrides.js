export function overrides(config) {
  return code => {
    let codeOverride = config[code]
    if (Object.values(config).includes(code) && !codeOverride) return false
    return codeOverride || code
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
