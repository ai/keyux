export function pressKeyUX(pressedClass) {
  let pressed

  function keyUp() {
    if (pressed) {
      pressed.classList.remove(...pressedClass.split(' '))
    }
  }

  function click(event) {
    if (event.clientX === 0 && event.clientY === 0) {
      event.target.classList.add(...pressedClass.split(' '))
      pressed = event.target
    }
  }

  return window => {
    window.addEventListener('keyup', keyUp)
    window.addEventListener('click', click)
    return () => {
      window.removeEventListener('click', keyUp)
      window.removeEventListener('keyup', keyUp)
    }
  }
}
