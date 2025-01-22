# Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

## 0.10.0
* Added support for hotkey with any modifier (`Alt`/`Meta`) inside text input.
* Added click by `Space` key support to `pressKeyUX()`.

## 0.9.0
* Added `inert` and `aria-hidden` support.

## 0.8.3
* Fixed `contenteditable` support (by @vitalybaev).

## 0.8.2
* Fixed hotkey with space support (by @vitalybaev).

## 0.8.1
* Fixed hotkeys with space (by @vitalybaev).

## 0.8.0
* Added ability to put focus to text input by hotkey.

## 0.7.2
* Fixed Safari support.

## 0.7.1
* Add support for hotkey with `Alt` on focus in text fields.

## 0.7.0
* Changed hotkeys override API with transformers (by @myandrienko).
* Added `hotkeyMacCompat` transformer (by @myandrienko).

## 0.6.2
* Reduced npm package size.

## 0.6.1
* Fixed `aria-controls` jump with loader in next menu.
* Fixed blur on `Esc` on last element of jump queue.
* Fixed pressed state on pressing two hotkeys.

## 0.6.0
* Added `toolbar` support to `focusGroupKeyUX()` (by @dmitry-kurmanov).

## 0.5.0
* Renamed `menuKeyUX()` to `focusGroupKeyUX()` (by @dmitry-kurmanov).
* Added more `role` to `focusGroupKeyUX()` (by @dmitry-kurmanov).

## 0.4.0
* Added hotkeys for list items (by Fedorov Ignatij).

## 0.3.1
* Fixed jumps for slow client-render apps.

## 0.3.0
* Changed modifier order for Windows canonical order (by @myandrienko).
* Improved Mac OS X support in `getHotKeyHint` (by @myandrienko).
* Fixed listeners leak in `pressKeyUX` (by @ilyhryh).
* Fixed docs (by @myandrienko, @lentsd, and @maximal).

## 0.2.1
* Fixed `menu` typing search and hotkeys conflict.

## 0.2.0
* Added typing search for `menu` (by @VladBrok).

## 0.1.2
* Fixed scroll on up/down keys in `menu`.
* Fixed jumps in real apps with slower render.

## 0.1.1
* Fixed focus jump to checked radio input.
* Fixed hotkey tracking with focus on radio input.
* Fixed focus jump after mouse click.

## 0.1.0
* Initial release.
