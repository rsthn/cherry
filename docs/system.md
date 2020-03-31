#	@rsthn/cherry/system

## Constants

Keyboard Action Codes
- `EVT_KEY_DOWN`
- `EVT_KEY_UP`

Pointer Action Codes
- `EVT_POINTER_DOWN`
- `EVT_POINTER_UP`
- `EVT_POINTER_MOVE`
- `EVT_POINTER_DRAG_START`
- `EVT_POINTER_DRAG_MOVE`
- `EVT_POINTER_DRAG_STOP`

Display orientations.
- `DEFAULT`
- `LANDSCAPE`
- `PORTRAIT`
- `AUTOMATIC`

<br/><br/>
## Properties

#### `screenWidth`: `int`, `screenHeight`: `int`
Screen resolution, obtained automatically when the system is initialized.

#### `initialMatrix`: [`Matrix`](matrix.md)
Initial transformation matrix. Should be used (if needed) instead of `loadIdentity()` since the `System` does some transformations first.

#### `displayBuffer`: [`Canvas`](canvas.md)
Display buffer for the renderer.

#### `tempDisplayBuffer`: [`Canvas`](canvas.md)
Small (320x240) temporal display buffer.

#### `keyState`: `Map`<`int`,`bool`>
Map with the status of all keys.

#### `keyEvtArgs`: `Object`
Event arguments for the keyboard events, contains the following properties:

|Property|Description
|--------|-----------
|`shift`: `bool`|Indicates if the SHIFT key is pressed.
|`ctrl`: `bool`|Indicates if the CTRL key is pressed.
|`alt`: `bool`|Indicates if the ALT key is pressed.
|`keyCode`: `int`|Last event keyCode.
|`keyState`: &`System.keyState`|Reference to `System.keyState`.

### `pointerState`: `Map`<`int`, `Object`>
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

#### `timeScale`: `float`
System's time scale, the frame delta is multiplied by this value before each system cycle, can be used to simulate slow-motion or high-speed when desired.

#### `fixedFrameInterval`: `float`
Fixed frame interval in milliseconds, when set to non-zero value the frame delta will be set to this value.

#### `frameDelta`: `float`
Last frame delta time in seconds.

#### `frameDeltaMillis`: `int`
Last frame delta time in milliseconds.

#### `frameTime`: `float`
Logical system time in seconds, increased by `frameDelta` on each update cycle.

#### `frameNumber`: `int`
Current frame number.

<br/><br/>
## Methods

#### `void` **`init`** (`options`: `Object`)
Initializes the system with the specified configuration.

#### `float` **`now`** (`asSeconds`: `bool` = `false`)
Returns the current time in milliseconds or seconds if `asSeconds` is set to `true`.

#### `float` **`time`** ()
Returns the current logical time in seconds (same as reading `System.frameTime`).

#### `void` **`start`** ()
Starts the system and enables rendering and updates.

### `void` **`stop`** ()
Stops the system by disabling both rendering and updates.

### `void` **`pause`** ()
Disables updates, but continues to render.

### `void` **`resume`** ()
Resumes updates if previously stopped with `pause()`.

### [`Linkable`](linkable.md) **`updateQueueAdd`** (`obj`: `Object`)
Adds the specified object to the update queue. Must have method `update` (`deltaTime`: `int`).

### `void` **`updateQueueRemove`**: (`obj`: `Object`)
### `void` **`updateQueueRemove`**: (`link`: [`Linkable`](linkable.md))
Removes the specified object from the update queue.

### [`Linkable`](linkable.md) **`drawQueueAdd`** (obj: Object)
Adds the specified object to the draw queue. Must have method `draw` (`canvas`: [`Canvas`](canvas.md)).

### `void` **`drawQueueRemove`**  (`obj`: `Object`)
### `void` **`drawQueueRemove`**  (`link`: [`Linkable`](linkable.md))
Removes the specified object from the draw queue.

### `Object` **`queueAdd`** (`obj`: `Object`)
Adds the specified object to the update and draw queues. Must have both `update` (`deltaTime`: `int`) and `draw` (`canvas`: [`Canvas`](canvas.md)) methods, returns `obj`.


### `void` `interpolate` (`src`: `Map`<`string`, `float`>, `dst`: `Map`<`string`, `float`>, `duration`: `Map`<`string`, `float`>, `easing`: `Map`<`string`, `function`>, `callback`: `function` (`data`: `Object`, `isFinished`: `bool`))
Interpolates numeric values between two objects (`src` and `dst`) using the specified `duration` and `easing` function.

### `void` **`onCanvasResized`** (`screenWidth`: `int`, `screenHeight`: `int`)
Event triggered when the canvas was resized by the system.

### `void` **`onKeyboardEvent`** (`action`: `int`, `keyCode`: `int`, `keys`: &`System.keyState`)
Event triggered when a keyboard event is detected by the system, `action` is one of the `EVT_KEY_*` constants, `keyCode` is one of the [`KeyCodes`](keycodes.md) constants and `keys` a reference to `System.keyEvtArgs`.

### `void` **`onPointerEvent`** (`action`, `pointer`, `pointers`)
Event triggered when a pointer event is detected by the system, `action` is one of the `EVT_POINTER_*` constants, `pointer` contains the pointer state, and `pointers` a reference to `System.pointerState`.
