# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

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
* Improved MacOS X support in `getHotKeyHint` (by @myandrienko).
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
