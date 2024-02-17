import { type FC, Fragment, createElement as h, useState } from 'react'
import { createRoot } from 'react-dom/client'

import {
  hiddenKeyUX,
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
  jumpKeyUX(),
  hiddenKeyUX()
])

const MenuItem: FC<{
  controls: string
  hotkey?: string
  route: string
  router: string
  routes?: string[]
  setRouter: (value: string) => void
  tabIndex?: number
}> = ({ controls, hotkey, route, router, routes, setRouter, tabIndex }) => {
  if (!routes) routes = [route]
  return h(
    'a',
    {
      'aria-controls': controls,
      'aria-current': routes.includes(router) ? 'page' : undefined,
      'aria-keyshortcuts': hotkey,
      'className': 'menu_item',
      'href': '#',
      'onClick': (e: MouseEvent) => {
        e.preventDefault()
        setRouter(route)
      },
      'role': 'menuitem',
      tabIndex
    },
    route[0].toUpperCase() + route.slice(1),
    hotkey ? h('kbd', {}, hotkey) : null
  )
}

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
    h(MenuItem, {
      controls: 'page',
      hotkey: 'h',
      route: 'home',
      router,
      setRouter
    }),
    h(MenuItem, {
      controls: 'about_menu',
      hotkey: 'a',
      route: 'about',
      router,
      routes: ['about', 'history', 'team'],
      setRouter
    }),
    h(MenuItem, {
      controls: 'page',
      hotkey: 'c',
      route: 'contact',
      router,
      setRouter
    })
  )
}

const Page: FC<{ router: string; setRouter: (value: string) => void }> = ({
  router,
  setRouter
}) => {
  let content = null
  if (router === 'home') {
    content = h(
      Fragment,
      {},
      h('input', {
        'aria-controls': 'results',
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
  } else if (router === 'about' || router === 'history' || router === 'team') {
    content = h(
      Fragment,
      {},
      h(
        'div',
        {
          'aria-hidden': true,
          'aria-orientation': 'vertical',
          'className': 'menu',
          'data-keyux-jump-only': true,
          'hidden': true,
          'id': 'about_menu',
          'role': 'menu'
        },
        h(MenuItem, {
          controls: 'about_subpage',
          route: 'history',
          router,
          setRouter,
          tabIndex: -1
        }),
        h(MenuItem, {
          controls: 'about_subpage',
          route: 'team',
          router,
          setRouter,
          tabIndex: -1
        })
      ),
      router === 'history' || router === 'team'
        ? h(
            'p',
            { id: 'about_subpage' },
            `The ${router} page `,
            h(
              'a',
              {
                href: '#',
                onClick: (e: MouseEvent) => {
                  e.preventDefault()
                  setRouter('about')
                }
              },
              'Back'
            )
          )
        : h('p', {}, `The ${router} page`)
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
    h(Page, { router, setRouter })
  )
}

createRoot(document.getElementById('app')!).render(h(App))
