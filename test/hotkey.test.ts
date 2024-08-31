import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { test } from 'node:test'
import { setTimeout } from 'node:timers/promises'

import {
  hotkeyKeyUX,
  type HotkeyOverride,
  hotkeyOverrides,
  startKeyUX
} from '../index.js'
import { press } from './utils.js'

test('adds hot keys to buttons and links', () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML =
    '<button aria-keyshortcuts="b">1</button>' +
    '<button aria-keyshortcuts="Ctrl+B">10</button>' +
    '<button aria-keyshortcuts="plus">100</button>' +
    '<a href="#" aria-keyshortcuts="meta+ctrl+alt+shift+b">1000</a>' +
    '<button aria-keyshortcuts="Shift+Space">10000</button>'

  let result = 0
  let buttons = window.document.querySelectorAll('button, a')
  for (let button of buttons) {
    button.addEventListener('click', () => {
      result += parseInt(button.textContent!)
    })
  }

  press(window, { key: 'b' })
  equal(result, 1)

  press(window, { altKey: true, key: 'b' })
  equal(result, 1)

  press(window, { key: 'b' })
  equal(result, 2)

  press(window, { ctrlKey: true, key: 'b' })
  equal(result, 12)

  press(window, { key: '+' })
  equal(result, 112)

  press(window, {
    altKey: true,
    ctrlKey: true,
    key: 'b',
    metaKey: true,
    shiftKey: true
  })
  equal(result, 1112)

  press(window, { key: ' ', shiftKey: true })
  equal(result, 11112)
})

test('stops event tracking', () => {
  let window = new JSDOM().window
  let stop = startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML = '<button aria-keyshortcuts="b"></button>'

  let clicked = 0
  window.document.querySelector('button')!.addEventListener('click', () => {
    clicked += 1
  })

  press(window, { key: 'b' })
  equal(clicked, 1)

  stop()
  press(window, { key: 'b' })
  equal(clicked, 1)

  startKeyUX(window, [hotkeyKeyUX()])
  press(window, { key: 'b' })
  equal(clicked, 2)
})

test('ignores hot keys when focus is inside text fields', () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML =
    '<input type="text">' +
    '<input type="radio">' +
    '<textarea></textarea>' +
    '<a></a>' +
    '<button aria-keyshortcuts="b"></button>'

  let clicked = 0
  window.document.querySelector('button')!.addEventListener('click', () => {
    clicked += 1
  })

  press(window, { key: 'b' }, window.document.querySelector('[type=text]')!)
  equal(clicked, 0)

  press(window, { key: 'b' }, window.document.querySelector('textarea')!)
  equal(clicked, 0)

  press(window, { key: 'b' }, window.document.querySelector('a')!)
  equal(clicked, 1)

  press(window, { key: 'b' }, window.document.querySelector('[type=radio]')!)
  equal(clicked, 2)
})

test('does not ignore hotkeys with Alt on focus in text field', () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML =
    '<input type="text">' +
    '<a></a>' +
    '<button aria-keyshortcuts="alt+b"></button>'

  let clicked = 0
  window.document.querySelector('button')!.addEventListener('click', () => {
    clicked += 1
  })

  press(
    window,
    { altKey: true, key: 'b' },
    window.document.querySelector('[type=text]')!
  )
  equal(clicked, 1)
})

test('supports non-English keyboard layouts', () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML = '<button aria-keyshortcuts="Alt+B"></button>'

  let clicked = 0
  window.document.querySelector('button')!.addEventListener('click', () => {
    clicked += 1
  })

  press(window, { altKey: true, code: 'KeyB', key: 'и' })
  equal(clicked, 1)
})

test('allows to override hotkeys', () => {
  let window = new JSDOM().window
  let overrides: HotkeyOverride = {}
  startKeyUX(window, [hotkeyKeyUX([hotkeyOverrides(overrides)])])
  window.document.body.innerHTML =
    '<button aria-keyshortcuts="b"></button>' +
    '<button aria-keyshortcuts="q"></button>'

  let clicked = ''
  for (let button of window.document.querySelectorAll('button')) {
    button.addEventListener('click', () => {
      clicked += button.getAttribute('aria-keyshortcuts')!
    })
  }

  overrides.q = 'b'
  overrides.a = 'q'
  press(window, { key: 'b' })
  equal(clicked, '')

  press(window, { key: 'q' })
  equal(clicked, 'b')

  press(window, { key: 'a' })
  equal(clicked, 'bq')

  press(window, { code: 'KeyQ', key: 'й' })
  equal(clicked, 'bqb')
})

test('ignores data-keyux-ignore-hotkeys and call after focus on it', () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML =
    '<ul>' +
    '<li tabindex="0" data-keyux-ignore-hotkeys>' +
    '<button aria-keyshortcuts="v">v1</button>' +
    '</li>' +
    '<li>' +
    '<button aria-keyshortcuts="v">v2</button>' +
    '</li>' +
    '</ul>'

  let clicked = ''
  for (let button of window.document.querySelectorAll('button')) {
    button.addEventListener('click', () => {
      clicked += button.textContent
    })
  }

  press(window, { key: 'v' })
  equal(clicked, 'v2')

  window.document.querySelector<HTMLElement>('li:first-child')!.focus()
  press(window, { key: 'v' })
  equal(clicked, 'v2v1')
})

test('calls element with data-keyux-hotkeys outside a container', () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML =
    '<ul>' +
    '<li tabindex="0" data-keyux-hotkeys="click-on-third" data-keyux-ignore-hotkeys>' +
    '<button aria-keyshortcuts="v">First button</button>' +
    '</li>' +
    '<li tabindex="0" data-keyux-ignore-hotkeys>' +
    '<button aria-keyshortcuts="v">Second button </button>' +
    '</li>' +
    '</ul>' +
    '<div id="click-on-third" data-keyux-ignore-hotkeys tabindex="0">' +
    '<button aria-keyshortcuts="v">Third button </button>' +
    '</div>'

  let clicked = ''
  for (let button of window.document.querySelectorAll('button')) {
    button.addEventListener('click', () => {
      clicked += button.textContent
    })
  }

  press(window, { key: 'v' })
  equal(clicked, '')

  window.document.querySelector<HTMLElement>('li:first-child')!.focus()
  press(window, { key: 'v' })
  equal(clicked, 'Third button ')

  window.document.querySelector<HTMLElement>('li:last-child')!.focus()
  press(window, { key: 'v' })
  equal(clicked, 'Third button Second button ')

  window.document.querySelector<HTMLElement>('div')!.focus()
  press(window, { key: 'v' })
  equal(clicked, 'Third button Second button Third button ')
})

test('calls element in data-keyux-hotkeys container', () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML =
    '<ul>' +
    '<li tabindex="0" data-keyux-hotkeys="panel" data-keyux-ignore-hotkeys>' +
    '<button aria-keyshortcuts="v">First button</button>' +
    '</li>' +
    '</ul>' +
    '<div id="panel" data-keyux-ignore-hotkeys>' +
    '<button aria-keyshortcuts="v">Panel button </button>' +
    '</div>'

  let clicked = ''
  for (let button of window.document.querySelectorAll('button')) {
    button.addEventListener('click', () => {
      clicked += button.textContent
    })
  }

  press(window, { key: 'v' })
  equal(clicked, '')

  window.document.querySelector<HTMLElement>('li')!.focus()
  press(window, { key: 'v' })
  equal(clicked, 'Panel button ')
})

test('looks inside focused after data-keyux-hotkeys', () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML =
    '<ul>' +
    '<li tabindex="0" data-keyux-hotkeys="panel" data-keyux-ignore-hotkeys>' +
    '<button aria-keyshortcuts="v">First button</button>' +
    '</li>' +
    '</ul>' +
    '<div id="panel" data-keyux-ignore-hotkeys>' +
    '<button>Panel button</button>' +
    '</div>'

  let clicked = ''
  for (let button of window.document.querySelectorAll('button')) {
    button.addEventListener('click', () => {
      clicked += button.textContent
    })
  }

  press(window, { key: 'v' })
  equal(clicked, '')

  window.document.querySelector<HTMLElement>('li')!.focus()
  press(window, { key: 'v' })
  equal(clicked, 'First button')
})

test('is ready for missed data-keyux-hotkeys', () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML =
    '<ul>' +
    '<li tabindex="0" data-keyux-hotkeys="panel">' +
    '</li>' +
    '</ul>' +
    '<button aria-keyshortcuts="v">Global</button>'

  let clicked = ''
  for (let button of window.document.querySelectorAll('button')) {
    button.addEventListener('click', () => {
      clicked += button.textContent
    })
  }

  window.document.querySelector<HTMLElement>('li:first-child')!.focus()
  press(window, { key: 'v' })
  equal(clicked, 'Global')
})

test('puts focus to text inputs', async () => {
  let window = new JSDOM().window
  startKeyUX(window, [hotkeyKeyUX()])
  window.document.body.innerHTML =
    '<input type="text" aria-keyshortcuts="i" />' +
    '<input type="button" aria-keyshortcuts="b" />' +
    '<textarea aria-keyshortcuts="t"></textarea>' +
    '<textarea aria-keyshortcuts="alt+t"></textarea>'

  let clicked = ''
  let interactives = window.document.querySelectorAll('input, textarea, button')
  for (let interactive of interactives) {
    interactive.addEventListener('click', () => {
      clicked += interactive.getAttribute('aria-keyshortcuts')!
    })
  }

  press(window, { key: 'i' })
  await setTimeout(1)
  equal(clicked, '')
  equal(
    window.document.activeElement,
    window.document.querySelector('input[type=text]')
  )

  press(window, { key: 't' })
  await setTimeout(1)
  equal(clicked, '')
  equal(
    window.document.activeElement,
    window.document.querySelector('input[type=text]')
  )

  press(window, { altKey: true, key: 't' })
  await setTimeout(1)
  equal(clicked, '')
  equal(
    window.document.activeElement,
    window.document.querySelector('textarea:last-of-type')
  )

  let textarea = window.document.activeElement as HTMLTextAreaElement
  textarea.blur()
  press(window, { key: 'b' })
  await setTimeout(1)
  equal(clicked, 'b')
  equal(window.document.activeElement, window.document.body)

  press(window, { key: 't' })
  await setTimeout(1)
  equal(clicked, 'b')
  equal(
    window.document.activeElement,
    window.document.querySelector('textarea:first-of-type')
  )
})
