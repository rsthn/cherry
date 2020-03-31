# System

An static class responsible of timely frame rendering, updates, and handling pointer and keyboard events.

## Usage

```js
const { System } = require('@rsthn/cherry');
-- or --
const System = require('@rsthn/cherry/system');
```

## Constants

#### Keyboard Action Codes
- `EVT_KEY_DOWN`
- `EVT_KEY_UP`

#### Pointer Action Codes
- `EVT_POINTER_DOWN`
- `EVT_POINTER_UP`
- `EVT_POINTER_MOVE`
- `EVT_POINTER_DRAG_START`
- `EVT_POINTER_DRAG_MOVE`
- `EVT_POINTER_DRAG_STOP`

#### Display orientations.
|Constant|Description
|----|-----------
|`DEFAULT`|Keep whatever orientation the user has, never rotate the canvas.
|`LANDSCAPE`|Force landscape orientation, will rotate the canvas when portrait is detected to ensure that `screenWidth` > `screenHeight`.
|`PORTRAIT`|Force portrait orientation, will rotate the canvas when landscape is detected to ensure that  `screenWidth` < `screenHeight`.
|`AUTOMATIC`|Detect either orientation and rotate the canvas accordingly.

<br/><br/>
## Properties

#### static `screenWidth`: `int`, static `screenHeight`: `int`
Screen resolution, obtained automatically when the system is initialized.

#### static `initialMatrix`: [`Matrix`](matrix.md)
Initial transformation matrix. Should be used (if needed) instead of `loadIdentity()` since the `System` does some transformations first.

#### static `displayBuffer`: [`Canvas`](canvas.md)
Display buffer for the renderer.

#### static `tempDisplayBuffer`: [`Canvas`](canvas.md)
Small (320x240) temporal display buffer.

#### static `keyState`: `Map`<`int`,`bool`>
Map with the status of all keys.

#### static `keyEvtArgs`: `Object`
Event arguments for the keyboard events, contains the following properties:

|Property|Description
|--------|-----------
|`shift`: `bool`|Indicates if the SHIFT key is pressed.
|`ctrl`: `bool`|Indicates if the CTRL key is pressed.
|`alt`: `bool`|Indicates if the ALT key is pressed.
|`keyCode`: `int`|Last event keyCode.
|`keyState`: &`System.keyState`|Reference to `System.keyState`.

### static `pointerState`: `Map`<`int`, `Object`>
Current status of all pointers. The related object is known as the Pointer State, and has the following properties:

|Property|Description
|--------|-----------
|`id`: `int`|The integer ID of the pointer. Usually 1 if using only a mouse, or can be any other number on multitouch environments.
|`isActive`: `bool`|Indicates if the pointer is down (true) or up (false).
|`isDragging`: `bool`|Indicates if a dragging operation is in place.
|`sx`: `float`|Start X value obtained the instant the pointer was held down.
|`sy`: `float`|Start Y value obtained the instant the pointer was held down.
|`x`: `float`|Current pointer X value.
|`y`: `float`|Current pointer Y value.
|`dx`: `float`|Delta X value for the current dragging operation.
|`dy`: `float`|Delta Y value for the current dragging operation.
|`button`: `int`|Indicates which button was pressed. For multitouch environments or left-click should be 1, for middle-button 2 and right-click 3.

#### static `timeScale`: `float`
System's time scale, the frame delta is multiplied by this value before each system cycle, can be used to simulate slow-motion or high-speed when desired.

#### static `fixedFrameInterval`: `float`
Fixed frame interval in milliseconds, when set to non-zero value the frame delta will be set to this value.

#### static `frameDelta`: `float`
Last frame delta time in seconds.

#### static `frameDeltaMillis`: `int`
Last frame delta time in milliseconds.

#### static `frameTime`: `float`
Logical system time in seconds, increased by `frameDelta` on each update cycle.

#### static `frameNumber`: `int`
Current frame number.

<br/><br/>
## Methods

#### static `void` **`init`** (`options`: `Object`)
Initializes the system with the specified configuration options.

|Property Name|Description|Default Value
|-------------|-----------|-------------
|`background`|Background color of the canvas.|`#000`
|`fps`|Maximum number of frames per second (FPS) the system should target.|`60`
|`minFps`|Minimum number of FPS the system is allowed to reach, when an FPS lower that this value is detected the system will ensure a fixed time step of 1000/minFps is used.|`15`
|`antialias`|Indicates if antialias should be enabled on the `System` Canvas.|`true`
|`targetScreenWidth`|When not-null or not-zero specifies the target screen width desired. If a larger or smaller width is detected on the client, the `System` will scale it appropriately such that you can always assume your width is `targetScreenWidth`.|`null`
|`targetScreenHeight`|Same as above, but for height.|`null`
|`orientation`|Specifies the target screen orientation. See available orientations below for details.|`System.DEFAULT`
|`fullscreen`|When `true` the `System` will use the `screen` object to size the canvas. When `false` it will use the `window`'s inner bounds.|`true`

#### static `float` **`now`** (`asSeconds`: `bool` = `false`)
Returns the current time in milliseconds or seconds if `asSeconds` is set to `true`.

#### static `float` **`time`** ()
Returns the current logical time in seconds (same as reading `System.frameTime`).

#### static `void` **`start`** ()
Starts the system and enables rendering and updates.

#### static `void` **`stop`** ()
Stops the system by disabling both rendering and updates.

#### static `void` **`pause`** ()
Disables updates, but continues to render.

#### static `void` **`resume`** ()
Resumes updates if previously stopped with `pause()`.

#### static [`Linkable`](linkable.md) **`updateQueueAdd`** (`obj`: `Object`)
Adds the specified object to the update queue. Must have method `update` (`deltaTime`: `int`).

#### static `void` **`updateQueueRemove`**: (`obj`: `Object`)
#### static `void` **`updateQueueRemove`**: (`link`: [`Linkable`](linkable.md))
Removes the specified object from the update queue.

#### static [`Linkable`](linkable.md) **`drawQueueAdd`** (obj: Object)
Adds the specified object to the draw queue. Must have method `draw` (`canvas`: [`Canvas`](canvas.md)).

#### static `void` **`drawQueueRemove`**  (`obj`: `Object`)
#### static `void` **`drawQueueRemove`**  (`link`: [`Linkable`](linkable.md))
Removes the specified object from the draw queue.

#### static `Object` **`queueAdd`** (`obj`: `Object`)
Adds the specified object to the update and draw queues. Must have both `update` (`deltaTime`: `int`) and `draw` (`canvas`: [`Canvas`](canvas.md)) methods, returns `obj`.


#### static `void` `interpolate` (`src`: `Map`<`string`, `float`>, `dst`: `Map`<`string`, `float`>, `duration`: `Map`<`string`, `float`>, `easing`: `Map`<`string`, `function`>, `callback`: `function` (`data`: `Object`, `isFinished`: `bool`))
Interpolates numeric values between two objects (`src` and `dst`) using the specified `duration` and `easing` function.

#### static `void` **`onCanvasResized`** (`screenWidth`: `int`, `screenHeight`: `int`)
Event triggered when the canvas was resized by the system.

#### static `void` **`onKeyboardEvent`** (`action`: `int`, `keyCode`: `int`, `keys`: &`System.keyState`)
Event triggered when a keyboard event is detected by the system, `action` is one of the `EVT_KEY_*` constants, `keyCode` is one of the [`KeyCodes`](keycodes.md) constants and `keys` a reference to `System.keyEvtArgs`.

#### static `void` **`onPointerEvent`** (`action`, `pointer`, `pointers`)
Event triggered when a pointer event is detected by the system, `action` is one of the `EVT_POINTER_*` constants, `pointer` contains the pointer state, and `pointers` a reference to `System.pointerState`.
