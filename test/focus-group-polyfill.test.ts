import { JSDOM } from 'jsdom'
import { equal } from 'node:assert'
import { describe, test } from 'node:test'
import { setTimeout } from 'node:timers/promises'

import {
  focusGroupKeyUX,
  focusGroupPolyfill,
  hotkeyKeyUX,
  startKeyUX
} from '../index.js'
import { press } from './utils.js'

describe('focus-group-polyfill', () => {
  test('moves focus by typing item name', async () => {
    let window = new JSDOM().window
    startKeyUX(window, [
      hotkeyKeyUX(),
      focusGroupPolyfill({
        searchDelayMs: 100
      })
    ])

    window.document.body.innerHTML =
      '<button aria-keyshortcuts="h">Button</button>' +
      '<nav focusgroup="inline">' +
      '<a href="#" type="button">HOME</a>' +
      '<a href="#" type="button">About</a>' +
      '<a href="#" type="button"> agh  </a>' +
      '<a href="#" type="button">Backspace</a>' +
      '</nav>'

    let clicked = 0
    window.document.querySelector('button')!.addEventListener('click', () => {
      clicked++
    })

    let items = window.document.querySelectorAll('a')
    items[0].focus()

    press(window, 'a')
    equal(window.document.activeElement, items[1])

    press(window, 'G')
    equal(window.document.activeElement, items[2])

    await setTimeout(150)
    press(window, 'h')
    equal(window.document.activeElement, items[0])
    equal(clicked, 0)

    press(window, 'a')
    equal(window.document.activeElement, items[0])

    await setTimeout(150)
    press(window, 'a')
    equal(window.document.activeElement, items[1])

    await setTimeout(150)
    press(window, 'Backspace')
    equal(window.document.activeElement, items[1])

    press(window, 'b')
    equal(window.document.activeElement, items[3])
  })

  test('stops tacking on loosing focus', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])

    window.document.body.innerHTML =
      '<nav focusgroup="block">' +
      '<a href="#" role="button">Home</a>' +
      '<a href="#" role="button">About</a>' +
      '<a href="#" role="button">Contact</a>' +
      '</nav>' +
      '<button>Button</button>'
    let button = window.document.querySelector('button')!
    let items = window.document.querySelectorAll('a')

    items[0].focus()
    items[0].blur()

    items[0].focus()
    button.focus()
    press(window, 'ArrowDown')
    equal(window.document.activeElement, button)

    items[0].focus()
    button.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        bubbles: true,
        key: 'ArrowDown'
      })
    )
    equal(window.document.activeElement, items[0])
  })

  test('is ready to click after focus', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])

    window.document.body.innerHTML =
      '<nav focusgroup="inline">' +
      '<button type="button">Item 1</button>' +
      '<button type="button">Item 2</button>' +
      '<button type="button">Item 3</button>' +
      '</nav>'
    let buttons = window.document.querySelectorAll('button')
    buttons[0].focus()
    buttons[1].click()

    equal(
      window.document.body.innerHTML,
      '<nav focusgroup="inline">' +
        '<button type="button" tabindex="-1">Item 1</button>' +
        '<button type="button" tabindex="0">Item 2</button>' +
        '<button type="button" tabindex="-1">Item 3</button>' +
        '</nav>'
    )
  })

  test('supports RTL locales', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])

    window.document.dir = 'rtl'
    window.document.body.innerHTML =
      '<nav focusgroup="inline">' +
      '<a href="#" type="button">Home</a>' +
      '<a href="#" type="button">About</a>' +
      '<a href="#" type="button">Contact</a>' +
      '</nav>'
    let items = window.document.querySelectorAll('a')
    items[0].focus()

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, items[1])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, items[0])
  })

  test('adds focusgroup widget', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div focusgroup>' +
      '<button role="button">Mac</button>' +
      '<button role="button">Windows</button>' +
      '<button role="button">Linux</button>' +
      '</div>'
    let buttons = window.document.querySelectorAll('button')
    buttons[0].focus()

    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[0])

    press(window, 'End')
    equal(window.document.activeElement, buttons[2])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[2])

    press(window, 'Home')
    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[0])
  })

  test('adds focusgroup inline widget', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div focusgroup="inline">' +
      '<button role="button">Mac</button>' +
      '<button role="button">Windows</button>' +
      '<button role="button">Linux</button>' +
      '</div>'
    let buttons = window.document.querySelectorAll('button')
    buttons[0].focus()

    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[0])

    press(window, 'End')
    equal(window.document.activeElement, buttons[2])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[2])

    press(window, 'Home')
    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[0])
  })

  test('adds focusgroup block widget', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div focusgroup="block">' +
      '<button role="button">Dog</button>' +
      '<button role="button">Cat</button>' +
      '<button role="button">Turtle</button>' +
      '</div>'
    let buttons = window.document.querySelectorAll('button')
    buttons[0].focus()

    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowDown')
    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowUp')
    equal(window.document.activeElement, buttons[0])

    press(window, 'End')
    equal(window.document.activeElement, buttons[2])

    press(window, 'Home')
    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[0])
  })

  test('disabling focusgroup memory', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div focusgroup="no-memory">' +
      '<button type="button">Item 1</button>' +
      '<button type="button">Item 2</button>' +
      '<button type="button">Item 3</button>' +
      '</div>'
    let buttons = window.document.querySelectorAll('button')
    buttons[0].focus()

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[1])

    buttons[1].blur()
    buttons[0].focus()

    equal(window.document.activeElement, buttons[0])
  })

  test('adds toolbar widget with focusgroup block option', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div role="toolbar" focusgroup="block">' +
      '<div>' +
      '<button type="button">Copy</button>' +
      '<button type="button">Paste</button>' +
      '<button type="button">Cut</button>' +
      '</div>' +
      '<div>' +
      '<input type="checkbox"/>' +
      '</div>' +
      '</div>'
    let buttons = window.document.querySelectorAll('button')
    let checkboxes = window.document.querySelectorAll('[type="checkbox"]')
    buttons[0].focus()

    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowDown')
    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowUp')
    equal(window.document.activeElement, buttons[0])

    press(window, 'End')
    equal(window.document.activeElement, checkboxes[0])

    press(window, 'Home')
    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[0])
  })

  test('stops event tracking', () => {
    let window = new JSDOM().window
    let stop = startKeyUX(window, [focusGroupPolyfill()])

    window.document.body.innerHTML =
      '<nav focusgroup="block">' +
      '<a href="#" role="button">Home</a>' +
      '<a href="#" role="button">About</a>' +
      '<a href="#" role="button">Contact</a>' +
      '</nav>'
    let items = window.document.querySelectorAll('a')
    items[0].focus()

    press(window, 'ArrowDown')
    equal(window.document.activeElement, items[1])

    stop()
    press(window, 'ArrowDown')
    equal(window.document.activeElement, items[1])
  })

  test('ignores broken DOM', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])

    window.document.body.innerHTML =
      '<a href="#" role="button">Home</a>' +
      '<a href="#" role="button">About</a>' +
      '<a href="#" role="button">Contact</a>'
    let items = window.document.querySelectorAll('a')
    items[0].focus()

    press(window, 'ArrowDown')
    equal(window.document.activeElement, items[0])

    window.document.body.innerHTML =
      '<nav focusgroup="inline wrap">' +
      '<a href="#" role="button">Home</a>' +
      '<a href="#" role="button">About</a>' +
      '<a href="#" role="button">Contact</a>' +
      '</nav>'
    let another = window.document.querySelectorAll('a')
    another[0].focus()

    window.document.querySelector('nav')!.role = ''
    press(window, 'ArrowDown')
    equal(window.document.activeElement, another[0])
  })

  test('enabling wrap behaviors in focusgroup', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div focusgroup="inline wrap">' +
      '<button role="button">Dog</button>' +
      '<button role="button">Cat</button>' +
      '<button role="button">Turtle</button>' +
      '</div>'
    let buttons = window.document.querySelectorAll('button')
    buttons[0].focus()

    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[0])

    press(window, 'End')
    equal(window.document.activeElement, buttons[2])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[0])

    press(window, 'Home')
    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[2])
  })

  test('disabling focusgroup=none elements', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div focusgroup="block">' +
      '<button role="button" focusgroup="none">Button 1</button>' +
      '<button role="button">Button 2</button>' +
      '<button role="button" focusgroup="none">Button 3</button>' +
      '<button role="button">Button 4</button>' +
      '</div>'
    let buttons = window.document.querySelectorAll('button')
    buttons[1].focus()

    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowDown')
    equal(window.document.activeElement, buttons[3])

    press(window, 'ArrowUp')
    equal(window.document.activeElement, buttons[1])

    press(window, 'End')
    equal(window.document.activeElement, buttons[3])

    press(window, 'Home')
    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[1])
  })

  test('focusgroup=none with wrap behavior', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div focusgroup="inline wrap">' +
      '<button role="button" focusgroup="none">Button 1</button>' +
      '<button role="button">Button 2</button>' +
      '<button role="button" focusgroup="none">Button 3</button>' +
      '<button role="button">Button 4</button>' +
      '</div>'
    let buttons = window.document.querySelectorAll('button')
    buttons[1].focus()

    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[3])

    press(window, 'End')
    equal(window.document.activeElement, buttons[3])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[1])

    press(window, 'Home')
    equal(window.document.activeElement, buttons[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[3])

    press(window, 'ArrowDown')
    equal(window.document.activeElement, buttons[3])

    press(window, 'ArrowUp')
    equal(window.document.activeElement, buttons[3])
  })

  test('skip all elements with focusgroup=none', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div focusgroup="wrap">' +
      '<button role="button" focusgroup="none">Button 1</button>' +
      '<button role="button" focusgroup="none">Button 2</button>' +
      '<button role="button" focusgroup="none">Button 3</button>' +
      '</div>'
    let buttons = window.document.querySelectorAll('button')
    buttons[0].focus()

    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, buttons[0])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, buttons[0])

    press(window, 'Home')
    equal(window.document.activeElement, buttons[0])

    press(window, 'End')
    equal(window.document.activeElement, buttons[0])
  })

  test('compatibility between the menu widget and the focusgroup polyfill', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupKeyUX(), focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div role="menu" aria-orientation="horizontal">' +
      '<a href="#" role="menuitem">Item 1</a>' +
      '<a href="#" role="menuitem">Item 2</a>' +
      '<a href="#" role="menuitem">Item 3</a>' +
      '</div>' +
      '<div focusgroup="inline">' +
      '<button role="button">Button 1</button>' +
      '<button role="button">Button 2</button>' +
      '<button role="button">Button 3</button>' +
      '</div>'

    let tabItems = window.document.querySelectorAll('a')
    let fgItems = window.document.querySelectorAll('button')

    tabItems[0].focus()
    equal(window.document.activeElement, tabItems[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, tabItems[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, tabItems[0])

    fgItems[0].focus()
    equal(window.document.activeElement, fgItems[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, fgItems[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, fgItems[0])
  })

  test('compatibility between the toolbar widget and the focusgroup polyfill', () => {
    let window = new JSDOM().window
    startKeyUX(window, [focusGroupKeyUX(), focusGroupPolyfill()])
    window.document.body.innerHTML =
      '<div role="tablist">' +
      '<button role="tab">Tab 1</button>' +
      '<button role="tab">Tab 2</button>' +
      '<button role="tab">Tab 3</button>' +
      '</div>' +
      '<div focusgroup="inline">' +
      '<a href="#" role="button">Button 1</a>' +
      '<a href="#" role="button">Button 2</a>' +
      '<a href="#" role="button">Button 3</a>' +
      '</div>'

    let tabItems = window.document.querySelectorAll('button')
    let fgItems = window.document.querySelectorAll('a')

    tabItems[0].focus()
    equal(window.document.activeElement, tabItems[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, tabItems[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, tabItems[0])

    fgItems[0].focus()
    equal(window.document.activeElement, fgItems[0])

    press(window, 'ArrowRight')
    equal(window.document.activeElement, fgItems[1])

    press(window, 'ArrowLeft')
    equal(window.document.activeElement, fgItems[0])
  })
})
