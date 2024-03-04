import loguxTsConfig from '@logux/eslint-config/ts'

export default [
  {
    ignores: ['coverage', 'test/demo/dist']
  },
  ...loguxTsConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'import/export': 'off', // Until they fix flat config support
      'no-control-regex': 'off'
    }
  }
]
