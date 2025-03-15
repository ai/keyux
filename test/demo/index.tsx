import React, { type FC, useState } from 'react'
import { createRoot } from 'react-dom/client'

import type { HotkeyOverride } from '../../index.js'
import {
  focusGroupKeyUX,
  focusGroupPolyfill,
  getHotKeyHint,
  hiddenKeyUX,
  hotkeyKeyUX,
  hotkeyMacCompat,
  hotkeyOverrides,
  jumpKeyUX,
  likelyWithKeyboard,
  pressKeyUX,
  startKeyUX
} from '../../index.js'

let overrides: HotkeyOverride = {}
let overridesTransformer = hotkeyOverrides(overrides)
let macCompatTransformer = hotkeyMacCompat()

startKeyUX(window, [
  hotkeyKeyUX([macCompatTransformer, overridesTransformer]),
  focusGroupKeyUX(),
  focusGroupPolyfill(),
  pressKeyUX('is-pressed'),
  jumpKeyUX(),
  hiddenKeyUX()
])

const HotKeyHint: FC<{ hotkey: string }> = ({ hotkey }) => {
  return likelyWithKeyboard(window) ? (
    <kbd>
      {getHotKeyHint(window, hotkey, [
        overridesTransformer,
        macCompatTransformer
      ])}
    </kbd>
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

const Search: FC = () => {
  return (
    <div>
      <input aria-keyshortcuts="f" placeholder="f" type="text" />
    </div>
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
            <button aria-keyshortcuts="v" tabIndex={-1}>
              First button <HotKeyHint hotkey="v" />
            </button>
          </li>
          <li data-keyux-ignore-hotkeys role="option" tabIndex={0}>
            <button aria-keyshortcuts="v" tabIndex={-1}>
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

        <div data-keyux-ignore-hotkeys id="panel">
          <button aria-keyshortcuts="v" tabIndex={-1}>
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

const Tabs: FC = () => {
  let [tab, setTab] = useState('home')
  return (
    <>
      <div className="tabs_list" role="tablist">
        <button
          aria-controls="tab_home"
          aria-selected={tab === 'home' ? 'true' : undefined}
          className="tabs_tab"
          onFocus={() => {
            setTab('home')
          }}
          role="tab"
        >
          Home Tab
        </button>
        <button
          aria-controls="tab_about"
          aria-selected={tab === 'about' ? 'true' : undefined}
          className="tabs_tab"
          onFocus={() => {
            setTab('about')
          }}
          role="tab"
        >
          About Tab
        </button>
        <button
          aria-controls="tab_contact"
          aria-selected={tab === 'contact' ? 'true' : undefined}
          className="tabs_tab"
          onFocus={() => {
            setTab('contact')
          }}
          role="tab"
        >
          Contact Tab
        </button>
      </div>

      <div
        className="tabs_body"
        hidden={tab !== 'home'}
        id="tab_home"
        role="tabpanel"
      >
        <div>Home Content</div>
        <input placeholder="Home input" type="text" />
      </div>

      <div
        className="tabs_body"
        hidden={tab !== 'about'}
        id="tab_about"
        role="tabpanel"
      >
        <div>About Content</div>
        <input placeholder="About input" type="text" />
      </div>

      <div
        className="tabs_body"
        hidden={tab !== 'contact'}
        id="tab_contact"
        role="tabpanel"
      >
        <div>Contact Content</div>
        <input placeholder="Contact input" type="text" />
      </div>
    </>
  )
}

const Toolbar: FC = () => {
  return (
    <>
      <div className="toolbar" role="toolbar">
        <div className="toolbar_group">
          <button className="toolbar_button" type="button">
            Copy
          </button>
          <button className="toolbar_button" type="button">
            Paste
          </button>
          <button className="toolbar_button" type="button">
            Cut
          </button>
        </div>
        <div className="toolbar_group">
          <label className="toolbar_label">
            <input type="checkbox" />
            Night Mode
          </label>
        </div>
      </div>
    </>
  )
}

const FocusGroup: FC = () => {
  return (
    <>
      <div
        className="focusgroup"
        // @ts-expect-error focusgroup is not official and is not part of types
        focusgroup={''}
        tabIndex={0}
      >
        <button type="button">Red</button>
        <button type="button">Yellow</button>
        <button type="button">Green</button>
      </div>
    </>
  )
}

const FocusGroupInline: FC = () => {
  return (
    <>
      <div
        className="focusgroup"
        // @ts-expect-error attr is not official and is not part of types
        focusgroup="inline no-memory"
        tabIndex={0}
      >
        <button
          // @ts-expect-error attr is not official and is not part of types
          focusgroup="none"
          type="button"
        >
          Mac
        </button>
        <button type="button">Windows</button>
        <button
          // @ts-expect-error attr is not official and is not part of types
          focusgroup="none"
          type="button"
        >
          Linux
        </button>
        <button type="button">Android</button>
        <button
          // @ts-expect-error attr is not official and is not part of types
          focusgroup="none"
          type="button"
        >
          IOS
        </button>
      </div>
    </>
  )
}

const FocusGroupBlock: FC = () => {
  return (
    <>
      <div
        className="focusgroup"
        // @ts-expect-error attr is not official and is not part of types
        focusgroup="block wrap"
        tabIndex={0}
      >
        <button
          // @ts-expect-error attr is not official and is not part of types
          focusgroup="none"
          type="button"
        >
          Dog
        </button>
        <button type="button">Cat</button>
        <button type="button">Turtle</button>
      </div>
    </>
  )
}

const App: FC = () => {
  let [, setUpdate] = useState({})
  let [router, setRouter] = useState('home')

  return (
    <>
      <Counter />
      <Search />
      <Menu router={router} setRouter={setRouter} />
      <Page
        router={router}
        setRouter={setRouter}
        update={() => {
          setUpdate({})
        }}
      />
      <Tabs />
      <Toolbar />
      <FocusGroup />
      <FocusGroupInline />
      <FocusGroupBlock />
    </>
  )
}

createRoot(document.getElementById('app')).render(<App />)
