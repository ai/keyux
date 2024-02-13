import { type FC, createElement as h, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { hotkeysKeyUX, startKeyUX } from '../../index.js'

startKeyUX(window, [hotkeysKeyUX({ pressedClass: 'is-pressed' })])

const App: FC = () => {
  let [clicked, setClicked] = useState(0)
  return h(
    'button',
    {
      'aria-keyshortcuts': 'b',
      'onClick': () => {
        setClicked(clicked + 1)
      }
    },
    `Clicked `,
    h('strong', {}, clicked),
    h('kbd', {}, 'b')
  )
}

createRoot(document.getElementById('app')!).render(h(App))
