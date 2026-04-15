export function hotkeyOverrides(overrides) {
  function getOverrided(code) {
    return Object.keys(overrides).find(key => overrides[key] === code)
  }

  return [
    code => overrides[code] || (getOverrided(code) ? false : code),
    code => getOverrided(code) || code
  ]
}
