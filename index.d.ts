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
 * import { hotkeysKeyUX, startKeyUX } from 'keyux'
 *
 * startKeyUX(window, [
 *   hotkeysKeyUX({ pressedClass: 'is-pressed' })
 * ])
 * ```
 */
export function hotkeysKeyUX(opts?: { pressedClass?: string }): KeyUXModule

/**
 * Start listeners for key events for better keyboard UX.
 *
 * ```js
 * import { hotkeys, startKeyUX } from 'keyux'
 *
 * startKeyUX(window, [
 *   hotkeys({ pressedClass: 'is-pressed' })
 * ])
 * ```
 */
export function startKeyUX(
  window: MinimalWindow,
  plugins: KeyUXModule[]
): () => void
