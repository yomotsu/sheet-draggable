# sheet-draggable

A lightweight utility that closes an element when dragged beyond a threshold - such as Bottom Sheet UI.
It ships only the drag-to-close behavior (no UI), and can be used standalone or together with any framework (React, Vue, Svelte, etc.).

[![Latest NPM release](https://img.shields.io/npm/v/sheet-draggable.svg)](https://www.npmjs.com/package/sheet-draggable)
![MIT License](https://img.shields.io/npm/l/sheet-draggable.svg)

## demos

## demos

- [bottom](https://yomotsu.github.io/sheet-draggable/examples/bottom.html)
- [top](https://yomotsu.github.io/sheet-draggable/examples/top.html)
- [right](https://yomotsu.github.io/sheet-draggable/examples/right.html)
- [handle](https://yomotsu.github.io/sheet-draggable/examples/handle.html)

## Usage

```shell
$ npm install --save https://www.npmjs.com/package/sheet-draggable```

```javascript
import { SheetDraggable } from 'sheet-draggable';

const openButtonEl = document.querySelector( '.OpenButton' );
const closeButtonEl = document.querySelector( '.CloseButton' );
const panelEl = document.querySelector( '.Panel' );

const sheet = new SheetDraggable( panelEl, { side: 'bottom' } );

openButtonEl.addEventListener( 'click', () => sheet.show() );
closeButtonEl.addEventListener( 'click', () => sheet.hide() );
```

### Options

| param              | required |     |
| ------------------ | -------- | --- |
| `side`             | optional | `'top' \| 'bottom' \| 'left' \| 'right'`. default is `'bottom'` |
| `handle`           | optional | CSS selector or HTMLElement for the drag handle. default is `undefined`, which means the entire panel is draggable. |
| `dismissThreshold` | optional | threshold in px to dismiss the sheet when released. default is `64` |
| `dragThreshold`    | optional | threshold in px to start dragging. default is `5` |

### Methods

| method        | description                          |
| ------------- | ------------------------------------ |
| `show()`      | Show the sheet                       |
| `hide()`      | Hide the sheet                       |
| `destroy()`   | Destroy the instance and event listeners |

### Events

| event         | description                          |
| ------------- | ------------------------------------ |
| `show`        | Fired when the sheet is shown        |
| `hide`        | Fired when the sheet is hidden       |
