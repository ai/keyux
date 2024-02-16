import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'

import { likelyWithKeyboard } from '../index.js'

test('detects keyboard', () => {
  let window = new JSDOM().window
  equal(likelyWithKeyboard(window), true)
})
