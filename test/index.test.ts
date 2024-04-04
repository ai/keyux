import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'

import {
  getHotKeyHint,
  hotkeyOverrides,
  likelyWithKeyboard,
  type MinimalWindow
} from '../index.js'

const IHPONE_WINDOW = {
  navigator: {
    platform: 'iPhone',
    userAgent: 'iPhone'
  }
} as MinimalWindow

const MAC_WINDOW = {
  navigator: {
    platform: 'Mac',
    userAgent: 'Mac'
  }
} as MinimalWindow

test('detects keyboard', () => {
  equal(likelyWithKeyboard(new JSDOM().window), true)
  equal(likelyWithKeyboard(IHPONE_WINDOW), false)
})

test('makes hotkey hint prettier', () => {
  let window = new JSDOM().window
  equal(getHotKeyHint(window, 'alt+b'), 'Alt + B')
  equal(
    getHotKeyHint(window, 'meta+ctrl+shift+alt+b'),
    'Meta + Ctrl + Shift + Alt + B'
  )
  equal(getHotKeyHint(window, 'alt+b', [hotkeyOverrides({ b: 'alt+b' })]), 'B')
  equal(getHotKeyHint(window, 'q', [hotkeyOverrides({ b: 'alt+b' })]), 'Q')
})

test('makes mac hotkey hint prettier', () => {
  equal(getHotKeyHint(MAC_WINDOW, 'alt+b'), '⌥ B')
  equal(getHotKeyHint(MAC_WINDOW, 'meta+ctrl+alt+shift+b'), '⌃ ⌥ ⇧ ⌘ B')
})
