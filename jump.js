export function jumpKeyUX(
  interactive = 'a, button, input, [tabindex]:not([tabindex="-1"])'
) {
  return window => {
    let jumps = []

    function focus(next) {
      let current = window.document.activeElement
      if (current && current !== window.document.body) {
        jumps.push(new WeakRef(current))
      }
      next.focus()
    }

    function back() {
      let ref = jumps.pop()
      if (!ref) {
        window.document.body.focus()
        window.document.body.blur()
        return
      }
      let el = ref.deref()
      if (el && el.isConnected) {
        el.focus()
      } else {
        back()
      }
    }

    function jump(from) {
      let ariaControls = from.getAttribute('aria-controls')
      if (!ariaControls) return
      setTimeout(() => {
        let area = window.document.getElementById(ariaControls)
        if (area) {
          let next = area.querySelector(interactive)
          if (next) focus(next)
        }
      }, 1)
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
