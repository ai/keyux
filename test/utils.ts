import type { DOMWindow } from 'jsdom'

export function mouseClick(
  window: DOMWindow,
  element: Element
): void {
  element.dispatchEvent(
    new window.MouseEvent('click', {
      bubbles: true
    })
  )
}

export function press(
  window: DOMWindow,
  key: Partial<Omit<KeyboardEventInit, 'view'>> | string,
  target: EventTarget = window.document.activeElement!
): void {
  let extra: Partial<Omit<KeyboardEventInit, 'view'>>
  if (typeof key === 'string') {
    extra = { key }
  } else {
    extra = key
  }
  let down = new window.KeyboardEvent('keydown', { bubbles: true, ...extra })
  target.dispatchEvent(down)
  let up = new window.KeyboardEvent('keyup', { bubbles: true, ...extra })
  target.dispatchEvent(up)
}

export function keyboardClick(window: DOMWindow, element: Element): void {
  press(window, 'Enter', element)
  element.dispatchEvent(
    new window.MouseEvent('click', {
      bubbles: true,
      clientX: 10,
      clientY: 10
    })
  )
}