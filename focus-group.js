const ROLES = {
  button: ['toolbar'],
  checkbox: ['toolbar'],
  menuitem: ['menu', 'menubar'],
  option: ['listbox'],
  tab: ['tablist']
}

function focus(current, next) {
  next.tabIndex = 0
  next.focus()
  current.tabIndex = -1
}

function findGroupNodeByEventTarget(target) {
  let itemRole = target.role || target.type || target.tagName
  if (!itemRole) return null

  let groupRoles = ROLES[itemRole.toLowerCase()]
  if (!groupRoles) return null

  for (let role of groupRoles) {
    let node = target.closest(`[role=${role}]`)
    if (node) return node
  }
}

function getItems(target, group) {
  if (group.role === 'toolbar') return getToolbarItems(group)
  return group.querySelectorAll(`[role=${target.role}]`)
}

function getToolbarItems(group) {
  let items = [...group.querySelectorAll('*')]
  return items.filter(item => {
    return (
      item.role === 'button' ||
      item.type === 'button' ||
      item.role === 'checkbox' ||
      item.type === 'checkbox'
    )
  })
}

function isHorizontalOrientation(group) {
  let ariaOrientation = group.getAttribute('aria-orientation')
  if (ariaOrientation === 'vertical') return false
  if (ariaOrientation === 'horizontal') return true

  let role = group.role
  return role === 'menubar' || role === 'tablist' || role === 'toolbar'
}

export function focusGroupKeyUX(options) {
  return window => {
    let inGroup = false
    let typingDelayMs = options?.searchDelayMs || 300
    let lastTyped = 0
    let searchPrefix = ''

    function keyDown(event) {
      let group = findGroupNodeByEventTarget(event.target)

      if (!group) {
        stop()
        return
      }

      let items = getItems(event.target, group)
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
        let items = getItems(event.target, group)
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
        let items = getItems(event.target, group)
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
