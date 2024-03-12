import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'

import { macCompat } from '../compat.js'
import type { MinimalWindow } from '../index.js'

const MAC_WINDOW = {
  navigator: {
    platform: 'Mac',
    userAgent: 'Mac'
  }
} as MinimalWindow

test('applies hotkey compatibility for Mac platform', () => {
  equal(macCompat()('meta+shift+b', MAC_WINDOW), 'ctrl+shift+b')
  equal(macCompat()('meta+ctrl+shift+b', MAC_WINDOW), 'meta+ctrl+shift+b')
})

test('applies hint compatibility for Mac platform', () => {
  equal(macCompat()('ctrl+shift+b', MAC_WINDOW, 'r'), 'meta+shift+b')
  equal(macCompat()('meta+ctrl+shift+b', MAC_WINDOW, 'r'), 'meta+ctrl+shift+b')
})

test('does nothing for non-Mac platform', () => {
  equal(macCompat()('meta+shift+b', new JSDOM().window), 'meta+shift+b')
  equal(macCompat()('ctrl+shift+b', new JSDOM().window, 'r'), 'ctrl+shift+b')
})
