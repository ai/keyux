export function pressKeyUX(pressedClass) {
  let pressedElement
  let classes = pressedClass.split(' ')
  let byEnter

  function keyDown(event) {
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      (event.target.tagName === 'BUTTON' || event.target.tagName === 'A')
    ) {
      keyUp()
      event.target.classList.add(...classes)
      pressedElement = event.target
      byEnter = event.target
    }
  }

  function keyUp() {
    if (pressedElement) {
      pressedElement.classList.remove(...classes)
      pressedElement = 0
      setTimeout(() => {
        byEnter = 0
      }, 0)
    }
  }

  function click(event) {
    if (event.clientX === 0 && event.clientY === 0) {
      if (pressedElement !== event.target) {
        keyUp()
        if (byEnter !== event.target) {
          event.target.classList.add(...classes)
          pressedElement = event.target
        }
      }
    }
  }

  return window => {
    window.addEventListener('click', click)
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    return () => {
      window.removeEventListener('click', click)
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
    }
  }
}
