import { type FC, Fragment, createElement as h, useState } from 'react'
import { createRoot } from 'react-dom/client'

import {
  hotkeysKeyUX,
  jumpKeyUX,
  menuKeyUX,
  pressKeyUX,
  startKeyUX
} from '../../index.js'

startKeyUX(window, [
  hotkeysKeyUX(),
  menuKeyUX(),
  pressKeyUX('is-pressed'),
  jumpKeyUX()
])

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

const Menu: FC<{ router: string; setRouter: (value: string) => void }> = ({
  router,
  setRouter
}) => {
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
        'aria-current': router === 'home' ? 'page' : undefined,
        'aria-keyshortcuts': 'h',
        'className': 'menu_item',
        'data-keyux-jump-into': 'page',
        'href': '#home',
        'onClick': (e: MouseEvent) => {
          e.preventDefault()
          setRouter('home')
        },
        'role': 'menuitem'
      },
      'Home',
      h('kbd', {}, 'h')
    ),
    h(
      'a',
      {
        'aria-current': router === 'about' ? 'page' : undefined,
        'aria-keyshortcuts': 'a',
        'className': 'menu_item',
        'data-keyux-jump-into': 'page',
        'href': '#about',
        'onClick': (e: MouseEvent) => {
          e.preventDefault()
          setRouter('about')
        },
        'role': 'menuitem'
      },
      'About',
      h('kbd', {}, 'a')
    ),
    h(
      'a',
      {
        'aria-current': router === 'contact' ? 'page' : undefined,
        'aria-keyshortcuts': 'c',
        'className': 'menu_item',
        'data-keyux-jump-into': 'page',
        'href': '#contact',
        'onClick': (e: MouseEvent) => {
          e.preventDefault()
          setRouter('contact')
        },
        'role': 'menuitem'
      },
      'Contact',
      h('kbd', {}, 'c')
    )
  )
}

const Page: FC<{ router: string }> = ({ router }) => {
  let content = null
  if (router === 'home') {
    content = h(
      Fragment,
      {},
      h('input', {
        'data-keyux-jump-into': 'results',
        'placeholder': 'Search',
        'type': 'search'
      }),
      h(
        'ul',
        { id: 'results', role: 'menu' },
        h('li', {}, h('a', { href: '#', role: 'menuitem' }, 'Search result 1')),
        h('li', {}, h('a', { href: '#', role: 'menuitem' }, 'Search result 2'))
      )
    )
  } else {
    content = h('p', {}, `The ${router} page`)
  }
  return h('main', { id: 'page' }, content)
}

const App: FC = () => {
  let [router, setRouter] = useState('home')
  return h(
    Fragment,
    {},
    h(Counter),
    h(Menu, { router, setRouter }),
    h(Page, { router })
  )
}

createRoot(document.getElementById('app')!).render(h(App))
