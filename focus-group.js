export function focusGroupKeyUX(options) {
  return window => {
    let inMenu = false
    let typingDelayMs = options?.searchDelayMs || 300
    let lastTyped = 0
    let searchPrefix = ''

    function focus(current, next) {
      next.tabIndex = 0
      next.focus()
      current.tabIndex = -1
    }

    function keyDown(event) {
      if (event.target.role !== 'menuitem') {
        stop()
        return
      }

      let menu = event.target.closest('[role="menu"]')
      if (!menu) return

      let items = menu.querySelectorAll('[role="menuitem"]')
      let index = Array.from(items).indexOf(event.target)

      let nextKey = 'ArrowDown'
      let prevKey = 'ArrowUp'
      if (menu.getAttribute('aria-orientation') === 'horizontal') {
        if (window.document.dir === 'rtl') {
          nextKey = 'ArrowLeft'
          prevKey = 'ArrowRight'
        } else {
          nextKey = 'ArrowRight'
          prevKey = 'ArrowLeft'
        }
      }

      if (event.key === nextKey) {
        event.preventDefault()
        focus(event.target, items[index + 1] || items[0])
      } else if (event.key === prevKey) {
        event.preventDefault()
        focus(event.target, items[index - 1] || items[items.length - 1])
      } else if (event.key === 'Home') {
        event.preventDefault()
        focus(event.target, items[0])
      } else if (event.key === 'End') {
        event.preventDefault()
        focus(event.target, items[items.length - 1])
      } else if (event.key.length === 1) {
        let now = Date.now()
        if (now - lastTyped <= typingDelayMs) {
          searchPrefix += event.key.toLowerCase()
        } else {
          searchPrefix = event.key.toLowerCase()
        }
        lastTyped = now

        let found = Array.from(items).find(item => {
          return item.textContent
            ?.trim()
            ?.toLowerCase()
            ?.startsWith(searchPrefix)
        })
        if (found) {
          event.preventDefault()
          focus(event.target, found)
        }
      }
    }

    function stop() {
      inMenu = false
      window.removeEventListener('keydown', keyDown)
    }

    function focusIn(event) {
      if (event.target.role === 'menuitem') {
        let menu = event.target.closest('[role="menu"]')
        if (!menu) return

        if (!inMenu) {
          inMenu = true
          window.addEventListener('keydown', keyDown)
        }
        let items = menu.querySelectorAll('[role="menuitem"]')
        for (let item of items) {
          if (item !== event.target) {
            item.setAttribute('tabindex', -1)
          }
        }
      } else if (inMenu) {
        stop()
      }
    }

    function focusOut(event) {
      if (!event.relatedTarget || event.relatedTarget === window.document) {
        stop()
      }
    }

    window.addEventListener('focusin', focusIn)
    window.addEventListener('focusout', focusOut)
    return () => {
      stop()
      window.removeEventListener('focusin', focusIn)
      window.removeEventListener('focusout', focusOut)
    }
  }
}
