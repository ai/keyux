import { type FC, Fragment, createElement as h, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { hotkeysKeyUX, menuKeyUX, pressKeyUX, startKeyUX } from '../../index.js'

startKeyUX(window, [hotkeysKeyUX(), menuKeyUX(), pressKeyUX('is-pressed')])

const Counter: FC = () => {
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

const Menu: FC = () => {
  return h(
    'nav',
    {
      'aria-orientation': 'horizontal',
      'className': 'menu',
      'role': 'menu'
    },
    h(
      'a',
      {
        className: 'menu_item',
        href: '#home',
        role: 'menuitem'
      },
      'Home'
    ),
    h(
      'a',
      {
        className: 'menu_item',
        href: '#about',
        role: 'menuitem'
      },
      'About'
    ),
    h(
      'a',
      {
        className: 'menu_item',
        href: '#contact',
        role: 'menuitem'
      },
      'Contact'
    )
  )
}

const App: FC = () => {
  return h(Fragment, {}, h(Counter), h(Menu))
}

createRoot(document.getElementById('app')!).render(h(App))
