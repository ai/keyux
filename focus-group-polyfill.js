function focus(current, next) {
  if (next) {
    next.tabIndex = 0
    next.focus()
    current.tabIndex = -1
  }
}

function findGroupNodeByEventTarget(target) {
  let fg = target.closest('[focusgroup]:not([focusgroup="none"])')
  if (fg) return fg
}

function getItems(group) {
  if (group.hasAttribute('focusgroup')) {
    let items = [...group.querySelectorAll('*:not([focusgroup="none"])')]
    return items.filter(item => {
      return (
        item.role === 'button' ||
        item.type === 'button' ||
        item.role === 'checkbox' ||
        item.type === 'checkbox'
      )
    })
  }
}

function isHorizontalOrientation(group) {
  let fg = group.getAttribute('focusgroup')
  if (fg !== null) return !fg.split(' ').includes('block')
}

export function focusGroupPolyfill() {
  return window => {
    let inGroup = false

    function keyDown(event) {
      let group = findGroupNodeByEventTarget(event.target)

      if (!group) {
        stop()
        return
      }

      let items = getItems(group)
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
        if (items[index + 1]) {
          focus(event.target, items[index + 1])
        } else if (group.getAttribute('focusgroup').includes('wrap')) {
          focus(event.target, items[0])
        }
      } else if (event.key === prevKey) {
        event.preventDefault()
        if (items[index - 1]) {
          focus(event.target, items[index - 1])
        } else if (group.getAttribute('focusgroup').includes('wrap')) {
          focus(event.target, items[items.length - 1])
        }
      } else if (event.key === 'Home') {
        event.preventDefault()
        focus(event.target, items[0])
      } else if (event.key === 'End') {
        event.preventDefault()
        focus(event.target, items[items.length - 1])
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

        let items = getItems(group)
        if (!items.some(item => item.getAttribute('tabindex') === '0')) {
          items.forEach((item, index) =>
            item.setAttribute('tabindex', index === 0 ? 0 : -1)
          )
          items[0]?.focus()
        } else {
          items.forEach(item => {
            if (item !== event.target) item.setAttribute('tabindex', -1)
          })
        }
      } else if (inGroup) {
        stop()
      }
    }

    function focusOut(event) {
      let group = findGroupNodeByEventTarget(event.target)
      if (group?.getAttribute('focusgroup')?.includes('no-memory')) {
        let items = getItems(group)
        items.forEach((item, index) => {
          item.setAttribute('tabindex', index === 0 ? 0 : -1)
        })
      }

      if (!event.relatedTarget || event.relatedTarget === window.document) {
        stop()
      }
    }

    function click(event) {
      let group = findGroupNodeByEventTarget(event.target)
      if (group) {
        let items = getItems(group)
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
