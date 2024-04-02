export function pressKeyUX(pressedClass) {
  let pressedElement
  let classes = pressedClass.split(' ')

  function keyUp() {
    if (pressedElement) {
      pressedElement.classList.remove(...classes)
    }
  }

  function click(event) {
    if (event.clientX === 0 && event.clientY === 0) {
      keyUp()
      event.target.classList.add(...classes)
      pressedElement = event.target
    }
  }

  return window => {
    window.addEventListener('keyup', keyUp)
    window.addEventListener('click', click)
    return () => {
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('click', click)
    }
  }
}
