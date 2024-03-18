const ROLES = {
  menuitem: ['menu', 'menubar'],
  option: ['listbox'],
  tab: ['tablist']
}

export function focusGroupKeyUX(options) {
  return window => {
    let inGroup = false
    let typingDelayMs = options?.searchDelayMs || 300
    let lastTyped = 0
    let searchPrefix = ''

    function focus(current, next) {
      next.tabIndex = 0
      next.focus()
      current.tabIndex = -1
    }

    function findGroupNodeByEventTarget(eventTarget) {
      if (
          (eventTarget.tagName === 'BUTTON' || eventTarget.role === 'button') &&
          eventTarget.closest('[role=toolbar]')
        ) {
        return eventTarget.closest('[role=toolbar]');
      }

      let itemRole = eventTarget.role
      let groupRoles = ROLES[itemRole]
      if (!groupRoles) return null

      for (let role of groupRoles) {
        let node = eventTarget.closest(`[role=${role}]`)
        if (node) return node
      }
    }

    function isHorizontalOrientation(group) {
      let ariaOrientation = group.getAttribute('aria-orientation')
      if (ariaOrientation === 'vertical') return false
      if (ariaOrientation === 'horizontal') return true

      let role = group.role
      return role === 'menubar' || role === 'tablist' || role === 'toolbar'
    }

    function keyDown(event) {
      let group = findGroupNodeByEventTarget(event.target)

      if (!group) {
        stop()
        return
      }

      let itemsSelector = event.target.role ? `[role=${event.target.role}]`: `${event.target.tagName}`
      let items = group.querySelectorAll(itemsSelector)
      let index = Array.from(items).indexOf(event.target)

      let nextKey = 'ArrowDown'
      let prevKey = 'ArrowUp'
      if (isHorizontalOrientation(group)) {
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
      } else if (event.key.length === 1 && group.role !== 'tablist') {
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
      inGroup = false
      window.removeEventListener('keydown', keyDown)
    }

    function focusIn(event) {
      let group = findGroupNodeByEventTarget(event.target)
      if (group) {
        if (!inGroup) {
          inGroup = true
          window.addEventListener('keydown', keyDown)
        }
        let items = group.querySelectorAll(`[role=${event.target.role}]`)
        for (let item of items) {
          if (item !== event.target) {
            item.setAttribute('tabindex', -1)
          }
        }
      } else if (inGroup) {
        stop()
      }
    }

    function focusOut(event) {
      if (!event.relatedTarget || event.relatedTarget === window.document) {
        stop()
      }
    }

    function click(event) {
      let group = findGroupNodeByEventTarget(event.target)
      if (group) {
        let items = group.querySelectorAll(`[role=${event.target.role}]`)
        for (let item of items) {
          if (item !== event.target) {
            item.setAttribute('tabindex', -1)
          }
        }
        event.target.setAttribute('tabindex', 0)
      }
    }

    window.addEventListener('click', click)
    window.addEventListener('focusin', focusIn)
    window.addEventListener('focusout', focusOut)
    return () => {
      stop()
      window.removeEventListener('click', click)
      window.removeEventListener('focusin', focusIn)
      window.removeEventListener('focusout', focusOut)
    }
  }
}
