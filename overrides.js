export function hotkeyOverrides(overrides) {
  function getOverrided(code) {
    for (let i in overrides) {
      if (overrides[i] === code) return i
    }
    return false
  }

  return [
    code => {
      let realCode = overrides[code]
      if (realCode || getOverrided(code) === false)  return realCode || code
      return false

    },
    code => getOverrided(code) || code
  ]
}
