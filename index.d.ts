export interface KeyUX {
  start(): void
  stop(): void
}

interface MinimalWindow {
  addEventListener(
    type: 'keydown' | 'keyup',
    listener: (event: {}) => void
  ): void

  document: {
    querySelector(selector: string): any
  }

  removeEventListener(
    type: 'keydown' | 'keyup',
    listener: (event: {}) => void
  ): void
}

export interface KeyUXModule {
  (window: MinimalWindow): () => void
}

/**
 * Press button/a according to `aria-keyshortcuts`.
 *
 * ```js
 * import { startKeyUX, hotkeysKeyUX } from 'keyux'
 *
 * startKeyUX(window, [
 *   hotkeysKeyUX()
 * ])
 * ```
 */
export function hotkeysKeyUX(): KeyUXModule

/**
 * Add arrow-navigation on `role="menu"`.
 *
 * ```js
 * import { startKeyUX, menuKeyUX } from 'keyux'
 *
 * startKeyUX(window, [
 *   menuKeyUX()
 * ])
 * ```
 */
export function menuKeyUX(): KeyUXModule

/**
 * Add pressed style on button activation from keyboard.
 *
 * ```js
 * import { startKeyUX, pressKeyUX } from 'keyux'
 *
 * startKeyUX(window, [
 *   pressKeyUX('is-pressed')
 * ])
 * ```
 */
export function pressKeyUX(className: string): KeyUXModule

/**
 * Start listeners for key events for better keyboard UX.
 *
 * ```js
 * import { startKeyUX, hotkeysKeyUX, menuKeyUX, pressKeyUX } from 'keyux'
 *
 * startKeyUX(window, [
 *   hotkeysKeyUX(),
 *   menuKeyUX(),
 *   pressKeyUX('is-pressed')
 * ])
 * ```
 */
export function startKeyUX(
  window: MinimalWindow,
  plugins: KeyUXModule[]
): () => void
