import loguxOxlintConfig from '@logux/oxc-configs/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [loguxOxlintConfig],
  rules: {
    'no-control-regex': 'off',
    // Until https://github.com/oxc-project/oxc/issues/21485
    'array-callback-return': 'off'
  }
})
