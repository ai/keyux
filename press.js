export function pressKeyUX(pressedClass) {
  let pressedElement
  let classes = pressedClass.split(' ')
  let down

  function keyDown(event) {
    if (
      event.key === 'Enter' &&
      (event.target.tagName === 'BUTTON' || event.target.tagName === 'A')
    ) {
      keyUp()
      event.target.classList.add(...classes)
      pressedElement = event.target
      down = event.target
    }
  }

  function keyUp() {
    if (pressedElement) {
      pressedElement.classList.remove(...classes)
    }
    down = null
  }

  function click(event) {
    if (event.clientX === 0 && event.clientY === 0) {
      if (down !== event.target) {
        keyUp()
        event.target.classList.add(...classes)
        pressedElement = event.target
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
