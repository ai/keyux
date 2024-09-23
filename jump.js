export function jumpKeyUX() {
  return window => {
    let jumps = []
    let lastFocusedElement = null

    function focus(next) {
      let current = window.document.activeElement
      if (current && current !== window.document.body) {
        jumps.push(new WeakRef(current))
      }
      next.focus({ focusVisible: true })
      lastFocusedElement = null
    }

    function jumpBack() {
      let ref = jumps.pop();
      if (ref) {
        let el = ref.deref();
    
        if (el && el.isConnected) {
          el.focus();
          return true;
        }
        return jumpBack();
      }
      return false;
    }
    
    function blur() {
      let activeElement = document.activeElement;
      if (activeElement && activeElement !== document.body) {
        lastFocusedElement = activeElement;
      }
      activeElement.blur();
    }
    
    function jumpBackOrBlur() {
      let successfullyJumped = jumpBack();
      if (!successfullyJumped) {
        blur();
      }
    }
    
    let tries = 0
    let finding

    function jump(from) {
      clearInterval(finding)
      tries = 0
      let ariaControls = from.getAttribute('aria-controls')
      finding = setInterval(() => {
        if (tries++ > 50) {
          clearInterval(finding)
          return
        }
        let area = window.document.getElementById(ariaControls)
        if (area) {
          let next = area.querySelector(
            'a, button, select, textarea, ' +
              'input:not([type=radio]), [type=radio]:checked, ' +
              '[tabindex]:not([tabindex="-1"])'
          )
          if (next) {
            clearInterval(finding)
            area.dispatchEvent(
              new window.CustomEvent('keyuxJump', { bubbles: true })
            )
            focus(next)
          }
        }
      }, 50)
    }

    function restoreFocus(event) {
      event.preventDefault()
      lastFocusedElement.focus({ focusVisible: true })
      lastFocusedElement = null
    }

    function keyDown(event) {
      if (event.target.getAttribute('aria-controls') && event.key === 'Enter') {
        jump(event.target)
      }

      if (event.key === 'Tab' && lastFocusedElement) {
        restoreFocus(event)
      } else if (event.key === 'Escape') {
        jumpBackOrBlur()
      }
    }

    window.addEventListener('keydown', keyDown)
    return () => {
      window.removeEventListener('keydown', keyDown)
    }
  }
}
