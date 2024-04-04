import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'

import { hotkeyMacCompat } from '../compat.js'
import type { MinimalWindow } from '../index.js'

const MAC_WINDOW = {
  navigator: {
    platform: 'Mac',
    userAgent: 'Mac'
  }
} as MinimalWindow

const [tranformForward, transformReverse] = hotkeyMacCompat()

test('applies hotkey compatibility for Mac platform', () => {
  equal(tranformForward('meta+shift+b', MAC_WINDOW), 'ctrl+shift+b')
  equal(tranformForward('meta+ctrl+shift+b', MAC_WINDOW), 'meta+ctrl+shift+b')
})

test('applies hint compatibility for Mac platform', () => {
  equal(transformReverse('ctrl+shift+b', MAC_WINDOW), 'meta+shift+b')
  equal(transformReverse('meta+ctrl+shift+b', MAC_WINDOW), 'meta+ctrl+shift+b')
})

test('does nothing for non-Mac platform', () => {
  equal(tranformForward('meta+shift+b', new JSDOM().window), 'meta+shift+b')
  equal(transformReverse('ctrl+shift+b', new JSDOM().window), 'ctrl+shift+b')
})
