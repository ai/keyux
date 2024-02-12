import { test } from 'node:test'
import { equal } from 'node:assert'

import { startKeyUX } from '../index.js'

test('is a function', () => {
  equal(typeof startKeyUX, 'function')
})
