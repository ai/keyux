export function hotkeyOverrides(overrides) {
  let getOverrided = code => Object.keys(overrides).find(key => overrides[key] === code)

  return [
    code => overrides[code] || (getOverrided(code) ? false : code),
    code => getOverrided(code) || code
  ]
}
