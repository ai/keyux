export function jumpKeyUX() {
  return window => {
    let jumps = []

    function focus(next) {
      let current = window.document.activeElement
      if (current && current !== window.document.body) {
        jumps.push(new WeakRef(current))
      }
      next.focus({ focusVisible: true })
    }

    function back() {
      let ref = jumps.pop()
      if (!ref) {
        window.document.activeElement.blur()
        window.document.documentElement.focus()
        window.document.documentElement.blur()
        return
      }
      let el = ref.deref()
      if (el && el.isConnected) {
        el.focus()
      } else {
        back()
      }
    }

    function jumpIfFound(area) {
      let next = area.querySelector(
        'a, button, select, textarea, ' +
          'input:not([type=radio]), [type=radio]:checked, ' +
          '[tabindex]:not([tabindex="-1"])'
      )
      if (next) focus(next)
      return next
    }

    function jump(from) {
      let ariaControls = from.getAttribute('aria-controls')
      if (!ariaControls) return
      setTimeout(() => {
        let area = window.document.getElementById(ariaControls)
        if (area) {
          area.dispatchEvent(
            new window.CustomEvent('keyuxJump', { bubbles: true })
          )
          if (!jumpIfFound(area)) {
            setTimeout(() => {
              jumpIfFound(area)
            }, 100)
          }
        }
      }, 10)
    }

    function click(event) {
      if (event.clientX === 0 && event.clientY === 0) {
        jump(event.target)
      }
    }

    function keyDown(event) {
      if (event.target.tagName === 'INPUT') {
        if (event.key === 'Enter') {
          jump(event.target)
        }
      }
      if (event.key === 'Escape') {
        back()
      }
    }

    window.addEventListener('click', click)
    window.addEventListener('keydown', keyDown)
    return () => {
      window.removeEventListener('click', click)
      window.removeEventListener('keydown', keyDown)
    }
  }
}
