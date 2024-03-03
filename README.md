# KeyUX

JS library to improve the keyboard UI of web apps. It is designed not only
for **a11y**, but also to create **professions tools** where users prefer
to use the keyboard.

* Add **hotkeys** with `aria-keyshortcuts`.
* Show a button’s `:active` state when a hotkey is pressed.
* Enable **navigation with keyboard arrows** in `role="menu"` lists.
* Jump to the next section according to `aria-controls` and back
  with <kbd>Esc</kbd>.
* Show and hide submenus of `role="menu"`.
* Allow users to **override hotkeys**.
* **1 KB** (minified and brotlied). No dependencies.
* Vanilla JS and works with any framework including React, Vue, Svelte.

```jsx
export const Button = ({ hotkey, children }) => {
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

Then add the `startKeyUX` call with the necessary features to the main JS file.

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

When the user presses a hotkey, KeyUX will click on the button or link
with the same hotkey in `aria-keyshortcuts`.

For instance, KeyUX will click on this button if user press
<kbd>Alt</kbd>+<kbd>B</kbd> or <kbd>⌥</kbd> <kbd>B</kbd>.

```js
<button aria-keyshortcuts="alt+b">Bold</button>
```

The hotkey pattern should contain modifiers like `meta+ctrl+alt+shift+b` in this exact order.

To enable this feature, call `hotkeyKeyUX`:

```js
import { hotkeyKeyUX, startKeyUX } from 'keyux'

startKeyUX(window, [
  hotkeyKeyUX()
])
```


### Hotkeys Hint

You can render the hotkey hint from the `aria-keyshortcuts` pattern in a prettier way:

```jsx
import { likelyWithKeyboard, getHotKeyHint } from 'keyux'

export const Button = ({ hokey, children }) => {
  return <button aria-keyshortcuts={hotkey}>
    {children}
    {likelyWithKeyboard(window) && <kbd>{getHotKeyHint(window, hotkey)}</kbd>}
  </button>
}
```

`likelyWithKeyboard()` returns `false` on mobile devices where user are unlikely
to be able to use hotkeys (but it is still possible by connecting an
external keyboard).

`getHotKeyHint()` replaces modifiers for Mac and makes text prettier.
For instance, for `alt+b` it will return `Alt + B` on Windows/Linux or `⌥ B`
on Mac.


### Pressed State

KeyUX can set class to show pressed state for a button when user
presses a hotkey. It will make the UI more responsive.

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
their browser’s extensions, system, or screen reader.

KeyUX allows to override hotkeys using the `overrides` object. Both `hotkeyKeyUX()`
and `getHotKeyHint()` accept it as an argument.

You will need to create some UI for users to fill this object like:

```js
const overrides = {
  'alt+b': 'b' // Override B to Alt + B
}
```

Then KeyUX will click on `aria-keyshortcuts="b"` when <kbd>Alt</kbd>+<kbd>B</kbd>
is pressed, and `getHotKeyHint(window, 'b', overrides)` will return `Alt + B`/`⌥ B`.


### Menu

Using only <kbd>Tab</kbd> for navigation is not very useful. User may need to
press it too many times to get to their button (also non-screen-reader users don’t
have quick navigation).

To reduce Tab-list you can group some related things (tabs or website’s menu)
into [`role="menu"`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/menu_role)
with arrow navigation.

```html
<nav role="menu">
  <a href="/" role="menuitem">Home</a>
  <a href="/catalog" role="menuitem">Catalog</a>
  <a href="/contacts" role="menuitem">Contacts</a>
</nav>
```

Users will use <kbd>Tab</kbd> to get inside the menu, and will use either arrows or <kbd>Home</kbd>,
<kbd>End</kbd> or an item name to navigate inside.

To enable this feature, call `menuKeyUX`.

```js
import { menuKeyUX } from 'keyux'

startKeyUX(window, [
  menuKeyUX()
])
```


### Jumps

After finishing in one section, you can move user’s focus to the next step to save
time. For example, you can move the cursor to the page after the user selects it
from the menu. Or, you can move the focus to the item’s form after the user selects an item
in the list.

You can control where the focus moves next with `aria-controls`.

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

On <kbd>Esc</kbd> the focus will jump back.

You can add `aria-controls` to `<input>` to make the focus jump on <kbd>Enter</kbd>.

```html
<input type="search" aria-controls="search_results" />
```

To enable this feature, call `jumpKeyUX`.

```js
import { menuKeyUX, jumpKeyUX } from 'keyux'

startKeyUX(window, [
  menuKeyUX(),
  jumpKeyUX()
])
```


### Nested Menu

You can make nested menus with KeyUX with `aria-controls`
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

You can make the nested menu visible by diabling `hidden`, but you will
have to set `tabindex="-1"` manually.

To enable this feature, call `hiddenKeyUX`.

```js
import { menuKeyUX, jumpKeyUX, hiddenKeyUX } from 'keyux'

startKeyUX(window, [
  menuKeyUX(),
  jumpKeyUX(),
  hiddenKeyUX()
])
```

### data-keyux-ignore-hotkeys attribute
It disables search this element. Also, if the element is in focuse, then the search is first start inside it, if it does not find it, then it searches on the pages

### data-keyux-hotkeys attribute
It ignore data-keys-ignore-hotkeys. Also, if the element is in focuse, then the search on the it