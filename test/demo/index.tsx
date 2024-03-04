import React, { type FC, useState } from 'react'
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
  return likelyWithKeyboard(window) ? (
    <kbd>{getHotKeyHint(window, hotkey, overrides)}</kbd>
  ) : null
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
  return (
    <a
      aria-controls={controls}
      aria-current={routes.includes(router) ? 'page' : undefined}
      aria-keyshortcuts={hotkey}
      className="menu_item"
      href="#"
      onClick={(e: React.MouseEvent) => {
        e.preventDefault()
        setRouter(route)
      }}
      role="menuitem"
      tabIndex={tabIndex}
    >
      {route[0].toUpperCase() + route.slice(1)}
      {hotkey ? <HotKeyHint hotkey={hotkey} /> : null}
    </a>
  )
}

const Counter: FC = () => {
  let [clicked, setClicked] = useState(0)
  return (
    <button
      aria-keyshortcuts="alt+b"
      onClick={() => {
        setClicked(clicked + 1)
      }}
    >
      Clicked <strong>{clicked}</strong>
      <HotKeyHint hotkey="alt+b" />
    </button>
  )
}

const Menu: FC<{ router: string; setRouter: (value: string) => void }> = ({
  router,
  setRouter
}) => {
  return (
    <nav aria-orientation="horizontal" className="menu" role="menu">
      <MenuItem
        controls="page"
        hotkey="h"
        route="home"
        router={router}
        setRouter={setRouter}
      />
      <MenuItem
        controls="about_menu"
        hotkey="a"
        route="about"
        router={router}
        routes={['about', 'history', 'team', 'treasury']}
        setRouter={setRouter}
      />
      <MenuItem
        controls="page"
        hotkey="s"
        route="settings"
        router={router}
        setRouter={setRouter}
      />
      <MenuItem
        controls="page"
        hotkey="l"
        route="list 1"
        router={router}
        setRouter={setRouter}
      />
      <MenuItem
        controls="page"
        hotkey="k"
        route="list 2"
        router={router}
        setRouter={setRouter}
      />
    </nav>
  )
}

const Page: FC<{
  router: string
  setRouter: (value: string) => void
  update: () => void
}> = ({ router, setRouter, update }) => {
  let content = null
  if (router === 'home') {
    content = (
      <>
        <input aria-controls="results" placeholder="Search" type="search" />
        <ul id="results" role="menu">
          <li>
            <a href="#" role="menuitem">
              First
            </a>
          </li>
          <li>
            <a href="#" role="menuitem">
              Second
            </a>
          </li>
        </ul>
      </>
    )
  } else if (router === 'list 1') {
    content = (
      <>
        <h2>Ignore unfocused buttons in a list</h2>
        <ul>
          <li data-keyux-ignore-hotkeys tabIndex={0}>
            <button aria-keyshortcuts="v">First button</button>
          </li>
          <li data-keyux-ignore-hotkeys tabIndex={0}>
            <button aria-keyshortcuts="v">Second button</button>
          </li>
        </ul>

        <button aria-keyshortcuts="v">Outside button</button>
        <button>Focus element</button>
      </>
    )
  } else if (router === 'list 2') {
    content = (
      <>
        <h2>Ignore unfocused elements and click outside a container</h2>
        <ul>
          <li
            data-keyux-hotkeys="click-on-first"
            data-keyux-ignore-hotkeys
            tabIndex={0}
          >
            <button aria-keyshortcuts="v">First button</button>
          </li>
          <li data-keyux-ignore-hotkeys tabIndex={0}>
            <button aria-keyshortcuts="v">Second button</button>
          </li>
        </ul>
        <div data-keyux-ignore-hotkeys tabIndex={0}>
          <button aria-keyshortcuts="v" id="click-on-first">
            Click on first button
          </button>
        </div>
      </>
    )
  } else if (
    router === 'about' ||
    router === 'history' ||
    router === 'team' ||
    router === 'treasury'
  ) {
    content = (
      <>
        <div
          aria-hidden={true}
          aria-orientation="vertical"
          className="menu"
          data-keyux-jump-only={true}
          hidden={true}
          id="about_menu"
          role="menu"
        >
          <MenuItem
            controls="about_subpage"
            route="history"
            router={router}
            setRouter={setRouter}
            tabIndex={-1}
          />
          <MenuItem
            controls="about_subpage"
            route="team"
            router={router}
            setRouter={setRouter}
            tabIndex={-1}
          />
          <MenuItem
            controls="about_subpage"
            route="treasury"
            router={router}
            setRouter={setRouter}
            tabIndex={-1}
          />
        </div>
        {router === 'history' || router === 'team' || router === 'treasury' ? (
          <p id="about_subpage">
            The {router} page{' '}
            <a
              href="#"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                setRouter('about')
              }}
            >
              Back
            </a>
          </p>
        ) : (
          <p>The {router} page</p>
        )}
      </>
    )
  } else {
    content = (
      <textarea
        defaultValue={Object.keys(overrides)
          .map(key => `${key}: ${overrides[key]}`)
          .join('\n')}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          for (let i in overrides) {
            delete overrides[i]
          }
          for (let i of e.target.value.split('\n')) {
            let [key, value] = i.split(/:\s*/)
            overrides[key] = value
          }
          update()
        }}
        placeholder="new: old\nnew: old"
      />
    )
  }
  return <main id="page">{content}</main>
}

const App: FC = () => {
  let [, setUpdate] = useState({})
  let [router, setRouter] = useState('home')

  return (
    <>
      <Counter />
      <Menu router={router} setRouter={setRouter} />
      <Page
        router={router}
        setRouter={setRouter}
        update={() => {
          setUpdate({})
        }}
      />
    </>
  )
}

createRoot(document.getElementById('app')!).render(<App />)
