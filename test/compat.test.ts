import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'

import { applyCompat, MAC_COMPAT } from '../compat.js'
import type { MinimalWindow } from '../index.js'

const MAC_WINDOW = {
  navigator: {
    platform: 'Mac',
    userAgent: 'Mac'
  }
} as MinimalWindow

const COMPAT_OVERRIDES = { ...MAC_COMPAT }

test('applies compatibility for Mac platform', () => {
  equal(
    applyCompat('meta+shift+b', MAC_WINDOW, COMPAT_OVERRIDES),
    'ctrl+shift+b'
  )
  equal(
    applyCompat('meta+ctrl+shift+b', MAC_WINDOW, COMPAT_OVERRIDES),
    'meta+ctrl+shift+b'
  )
})

test('applies reverse compatibility for Mac platform', () => {
  equal(
    applyCompat('ctrl+shift+b', MAC_WINDOW, COMPAT_OVERRIDES, 'reverse'),
    'meta+shift+b'
  )
  equal(
    applyCompat('meta+ctrl+shift+b', MAC_WINDOW, COMPAT_OVERRIDES, 'reverse'),
    'meta+ctrl+shift+b'
  )
})

test('does nothing for non-Mac platform', () => {
  equal(
    applyCompat('meta+shift+b', new JSDOM().window, COMPAT_OVERRIDES),
    'meta+shift+b'
  )
  equal(
    applyCompat(
      'ctrl+shift+b',
      new JSDOM().window,
      COMPAT_OVERRIDES,
      'reverse'
    ),
    'ctrl+shift+b'
  )
})
