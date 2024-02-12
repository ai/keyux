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

export interface KeyUXOptions {
  pressedClass?: string
}

/**
 * Create an instance to control key events for better keyboard UX.
 */
export function createKeyUX(window: MinimalWindow, opts?: KeyUXOptions): KeyUX

/**
 * Start listeners for key events for better keyboard UX.
 */
export function startKeyUX(window: MinimalWindow, opts?: KeyUXOptions): KeyUX
