export function hiddenKeyUX() {
  return window => {
    let allowed
    let wasHidden

    function jump(e) {
      if (e.target.getAttribute('aria-hidden') === 'true') {
        allowed = e.target
        allowed.setAttribute('aria-hidden', 'false')
        wasHidden = allowed.hidden
        if (wasHidden) allowed.hidden = false
        let first = e.target.querySelector(
          'a, button, select, textarea, ' +
            'input:not([type=radio]), [type=radio]:checked, ' +
            '[tabindex]:not([tabindex="-1"])'
        )
        if (first) first.tabIndex = 0
      }
    }

    function focusOut(e) {
      if (
        allowed &&
        allowed.contains(e.target) &&
        (!e.relatedTarget || !allowed.contains(e.relatedTarget))
      ) {
        e.target.tabIndex = -1
        allowed.setAttribute('aria-hidden', 'true')
        if (wasHidden) allowed.hidden = true
        allowed = null
      }
    }

    window.addEventListener('keyuxJump', jump)
    window.addEventListener('focusout', focusOut)
    return () => {
      window.removeEventListener('keyuxJump', jump)
      window.removeEventListener('focusout', focusOut)
    }
  }
}
