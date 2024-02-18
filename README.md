# KeyUX

JS library to improve keyboard UI of web apps. It was designed not only
for **a11y** but also to create **professions tools** where users prefer
using keyboard.

* Add **hotkeys** support by `aria-keyshortcuts`.
* Show button’s `:active` state when user press hotkey.
* Enable **arrows navigation** in `role="menu"` lists.
* Jump to next section according to `aria-controls` and back by <kbd>Esc</kbd>.
* Show/hide submenus of `role="menu"`.
* Allows users to **override hotkeys**.
* **1 KB** (minified and brotlied). No dependencies.
* Vanilla JS and works with any framework including React, Vue, Svelte.

```jsx
export const Button = ({ hokey, children }) => {
  return <button aria-keyshortcuts={hotkey}>
    {children}
    {likelyWithKeyboard(window) && <kbd>{getHotKeyHint(window, hotkey)}</kbd>}
  </button>
}
```

See [demo page](https://ai.github.io/keyux/)
and [example](./test/demo/index.tsx).

---

<img src="https://cdn.evilmartians.com/badges/logo-no-label.svg" alt="" width="22" height="16" />  Made in <b><a href="https://evilmartians.com/devtools?utm_source=keyux&utm_campaign=devtools-button&utm_medium=github">Evil Martians</a></b>, product consulting for <b>developer tools</b>.

---


## Install

```sh
npm install keyux
```

Then add `startKeyUX` call with necessary features to main JS file.

```js
import {
  hiddenKeyUX,
  hotkeyKeyUX,
  jumpKeyUX,
  menuKeyUX,
  pressKeyUX,
  startKeyUX
} from 'keyux'

const overrides = {}

startKeyUX(window, [
  hotkeyKeyUX(overrides),
  menuKeyUX(),
  pressKeyUX('is-pressed'),
  jumpKeyUX(),
  hiddenKeyUX()
])
```


## Features

### Hotkeys

If user will press hotkey, KeyUX will click on button or link
with `aria-keyshortcuts` with the same hotkey.

For instance, KeyUX will click on this button if user press
<kbd>Alt</kbd>+<kbd>B</kbd> or <kbd>⌥</kbd>+<kbd>B</kbd>.

```js
<button aria-keyshortcuts="alt+b">Bold</button>
```

The hotkey pattern should modifiers like `meta+ctrl+shift+alt+b` in exact order.

To enable this feature, you need to call `hotkeyKeyUX`:

```js
import { hotkeyKeyUX, startKeyUX } from 'keyux'

startKeyUX(window, [
  hotkeyKeyUX()
])
```


### Hotkeys Hint

You can render hotkey hint from `aria-keyshortcuts` pattern in a prettier way:

```jsx
import { likelyWithKeyboard, getHotKeyHint } from 'keyux'

export const Button = ({ hokey, children }) => {
  return <button aria-keyshortcuts={hotkey}>
    {children}
    {likelyWithKeyboard(window) && <kbd>{getHotKeyHint(window, hotkey)}</kbd>}
  </button>
}
```

`likelyWithKeyboard()` returns `false` on mobile devices where user likely
will not be able to use hotkeys (but it is still possible by connecting
external keyboard).

`getHotKeyHint()` will replace modifiers for Mac and make text more pretty.
For instance, for `alt+b` it will return `Alt + B` on Windows/Linux or `⌥ + B`
on Mac.


### Pressed State

KeyUX can set class to show pressed state for button when user
will press hotkey. It will make UI more responsible.

```js
import { hotkeyKeyUX, startKeyUX, pressKeyUX } from 'keyux'

startKeyUX(window, [
  pressKeyUX('is-pressed'),
  hotkeyKeyUX()
])
```

```css
button {
  &:active,
  &.is-pressed {
    transform: scale(0.95);
  }
}
```

You can use
[`postcss-pseudo-classes`](https://github.com/giuseppeg/postcss-pseudo-classes)
to automatically add class for every `:active` state in your CSS.


### Hotkeys Override

Many users want to override hotkeys because your hotkeys can conflict with
browser’s extensions, system, or screen reader.

KeyUX allows to override hotkeys by `overrides` object. Both `hotkeyKeyUX()`
and `getHotKeyHint()` accepts it as argument.

You will need to create some UI for user to fill this object like:

```js
const overrides = {
  'alt+b': 'b' // Override B to Alt + B
}
```

Then KeyUX will click on `aria-keyshortcuts="b"` on <kbd>Alt</kbd>+<kbd>B</kbd>
press and `getHotKeyHint(window, 'b', overrides)` will return `Alt + B`/`⌥ + B`.


### Menu

Using only <kbd>Tab</kbd> for navigation is not very useful. User may need to
press it to many to get their button (also non-screen-reader users don’t
have quick navigation).

To reduce Tab-list you can group some related things (tabs or website’s menu)
into [`role="menu"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/menu_role)
with arrows navigation.

```html
<nav role="menu">
  <a href="/" role="menuitem">Home</a>
  <a href="/catalog" role="menuitem">Catalog</a>
  <a href="/contacts" role="menuitem">Contacts</a>
</nav>
```

Users will use Tab to go inside menu and will use arrows and <kbd>Home</kbd>,
<kbd>End</kbd> to navigate inside.

To enable this feature call `menuKeyUX`.

```js
import { menuKeyUX } from 'keyux'

startKeyUX(window, [
  menuKeyUX()
])
```


### Jumps

After finishing in one section, you can move user’s focus on next step to save
time. For instance, you can move cursor to the page after user select it
in the menu. Or you can move focus to item’s form after user select item
in the list.

You can control where to move focus next by `aria-controls`.

```jsx
<div role="menu">
  {products.map(({ id, name }) =>
    <button role="menuitem" aria-controls="product_form">{name}</button>
  )}
</div>

<div id="product_form">
  …
</div>
```

On <kbd>Esc</kbd> focus will jump back.

You can add `aria-controls` to `<input>` to jump focus on <kbd>Enter</kbd>.

```html
<input type="search" aria-controls="search_results" />
```

To enable this feature call `jumpKeyUX`.

```js
import { menuKeyUX, jumpKeyUX } from 'keyux'

const overrides = {}

startKeyUX(window, [
  menuKeyUX(),
  jumpKeyUX()
])
```


### Nested Menu

You can make nested menus with KeyUX by `aria-controls`
and `aria-hidden="true"`.

```html
<button aria-controls="edit" aria-haspopup="menu">Edit</button>

<div id="edit" hidden aria-hidden="true" role="menu">
  <button role="menuitem">Undo</button>
  <button role="menuitem" aria-controls="find" aria-haspopup="menu">Find</button>
</div>

<div id="find" hidden aria-hidden="true" role="menu">
  <button role="menuitem">Find…</button>
  <button role="menuitem">Replace…</button>
</div>
```

You can make visible nested menu by avoiding setting `hidden`, but you will
need to set `tabindex="-1"` manually.

To enable this feature call `hiddenKeyUX`.

```js
import { menuKeyUX, jumpKeyUX, hiddenKeyUX } from 'keyux'

const overrides = {}

startKeyUX(window, [
  menuKeyUX(),
  jumpKeyUX(),
  hiddenKeyUX()
])
```
