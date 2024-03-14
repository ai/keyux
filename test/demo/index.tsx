import React, { type FC, useState } from 'react'
import { createRoot } from 'react-dom/client'

import type { HotkeyOverride } from '../../index.js'
import {
  focusGroupKeyUX,
  getHotKeyHint,
  hiddenKeyUX,
  hotkeyKeyUX,
  jumpKeyUX,
  likelyWithKeyboard,
  pressKeyUX,
  startKeyUX
} from '../../index.js'

let overrides: HotkeyOverride = {}

startKeyUX(window, [
  hotkeyKeyUX(overrides),
  focusGroupKeyUX(),
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

const Tablist: FC = () => {
  let [tab, setTab] = useState('home')
  return (
    <>
      <div className="tablist" role="tablist">
        <button
          className="tablist_tab"
          aria-selected={tab === 'home' ? 'true' : undefined}
          aria-controls="tab_home"
          onFocus={() => {
            setTab('home')
          }}
          role="tab"
        >
          Home Tab
        </button>
        <button
          className="tablist_tab"
          aria-selected={tab === 'about' ? 'true' : undefined}
          aria-controls="tab_about"
          onFocus={() => {
            setTab('about')
          }}
          role="tab"
        >
          About Tab
        </button>
        <button
          className="tablist_tab"
          aria-selected={tab === 'contact' ? 'true' : undefined}
          aria-controls="tab_contact"
          onFocus={() => {
            setTab('contact')
          }}
          role="tab"
        >
          Contact Tab
        </button>
      </div>

      <div
        className={'tabcontent ' + (tab === 'home' ? 'is-current' : '')}
        id="tab_home"
      >
        <div>Home Content</div>
        <input placeholder="Home input" type="text" />
      </div>

      <div
        className={'tabcontent ' + (tab === 'about' ? 'is-current' : '')}
        id="tab_about"
      >
        <div>About Content</div>
        <input placeholder="About input" type="text" />
      </div>

      <div
        className={'tabcontent ' + (tab === 'contact' ? 'is-current' : '')}
        id="tab_contact"
      >
        <div>Contact Content</div>
        <input placeholder="Contact input" type="text" />
      </div>
    </>
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
        route="list1"
        router={router}
        setRouter={setRouter}
      />
      <MenuItem
        controls="page"
        hotkey="k"
        route="list2"
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
        <ul id="results" role="listbox">
          <li>
            <a href="#" role="option">
              First
            </a>
          </li>
          <li>
            <a href="#" role="option">
              Second
            </a>
          </li>
        </ul>
      </>
    )
  } else if (router === 'list1') {
    content = (
      <>
        <h2>List item hotkey</h2>
        <ul role="listbox">
          <li data-keyux-ignore-hotkeys role="option" tabIndex={0}>
            <button aria-keyshortcuts="v">
              First button <HotKeyHint hotkey="v" />
            </button>
          </li>
          <li data-keyux-ignore-hotkeys role="option" tabIndex={0}>
            <button aria-keyshortcuts="v">
              Second button <HotKeyHint hotkey="v" />
            </button>
          </li>
        </ul>
        <button aria-keyshortcuts="v">
          Outside button <HotKeyHint hotkey="v" />
        </button>
      </>
    )
  } else if (router === 'list2') {
    content = (
      <>
        <h2>List item hotkey with panel</h2>
        <ul role="listbox">
          <li data-keyux-hotkeys="panel" role="option" tabIndex={0}>
            First item
          </li>
          <li data-keyux-hotkeys="panel" role="option" tabIndex={0}>
            Second item
          </li>
        </ul>

        <div data-keyux-ignore-hotkeys id="panel" tabIndex={0}>
          <button aria-keyshortcuts="v">
            Click on panel button <HotKeyHint hotkey="v" />
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
      <Tablist />
    </>
  )
}

createRoot(document.getElementById('app')!).render(<App />)
