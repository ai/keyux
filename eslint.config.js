import loguxTsConfig from '@logux/eslint-config/ts'

export default [
  {
    ignores: ['coverage', 'test/demo/dist']
  },
  ...loguxTsConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'no-control-regex': 'off'
    }
  }
]
