import { type FC, Fragment, createElement as h, useState } from 'react'
import { createRoot } from 'react-dom/client'

import type { HotkeyOverride } from '../../index.js'
import {
  getHotKeyHint,
  hiddenKeyUX,
  hotkeyKeyUX,
  jumpKeyUX,
  likelyWithKeyboard,
  menuKeyUX,
  pressKeyUX,
  startKeyUX
} from '../../index.js'

let overrides: HotkeyOverride = {}

startKeyUX(window, [
  hotkeyKeyUX(overrides),
  menuKeyUX(),
  pressKeyUX('is-pressed'),
  jumpKeyUX(),
  hiddenKeyUX()
])

const HotKeyHint: FC<{ hotkey: string }> = ({ hotkey }) => {
  return likelyWithKeyboard(window)
    ? h('kbd', {}, getHotKeyHint(window, hotkey, overrides))
    : null
}

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
    hotkey ? h(HotKeyHint, { hotkey }) : null
  )
}

const Counter: FC = () => {
  let [clicked, setClicked] = useState(0)
  return h(
    'button',
    {
      'aria-keyshortcuts': 'alt+b',
      'onClick': () => {
        setClicked(clicked + 1)
      }
    },
    `Clicked `,
    h('strong', {}, clicked),
    h(HotKeyHint, { hotkey: 'alt+b' })
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
      hotkey: 's',
      route: 'settings',
      router,
      setRouter
    })
  )
}

const Page: FC<{
  router: string
  setRouter: (value: string) => void
  update: () => void
}> = ({ router, setRouter, update }) => {
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
    content = h('textarea', {
      defaultValue: Object.keys(overrides)
        .map(key => `${key}: ${overrides[key]}`)
        .join('\n'),
      onChange: (e: Event) => {
        let textarea = e.target as HTMLTextAreaElement
        for (let i in overrides) {
          delete overrides[i]
        }
        for (let i of textarea.value.split('\n')) {
          let [key, value] = i.split(/:\s*/)
          overrides[key] = value
        }
        update()
      },
      placeholder: 'new: old\nnew: old'
    })
  }
  return h('main', { id: 'page' }, content)
}

const App: FC = () => {
  let [, setUpdate] = useState({})
  let [router, setRouter] = useState('home')

  return h(
    Fragment,
    {},
    h(Counter),
    h(Menu, { router, setRouter }),
    h(Page, {
      router,
      setRouter,
      update() {
        setUpdate({})
      }
    })
  )
}

createRoot(document.getElementById('app')!).render(h(App))
