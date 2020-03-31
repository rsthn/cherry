# Linkable

Generic class for linkable items such as required by linked lists. The responsibility of this class is to wrap a value into a linkable object.

NOTE: This class uses the [`Recycler`](recycler.md) facility, therefore allocation and deallocation should be done by using the `alloc` and `dispose` methods respectively.

## Usage

```js
const { Linkable } = require('@rsthn/cherry');
-- or --
const Linkable = require('@rsthn/cherry/linkable');
```

## Properties

#### `prev`: `Linkable`
Pointer to the previous item in the chain.

#### `next`: `Linkable`
Pointer to the next item in the chain.

#### `value`: `any`
Wrapped value.

## Methods

#### static `Linkable` **`alloc`** (`value`: `any`)
Constructs the linkable to wrap the specified value.

#### `void` **`dispose`** ()
Disposes the linkable, the wrapped value is preserved.

#### `Linkable` **`clear`** ()
Sets the previous/next connection pointers to null. Returns `this`.

#### `void` **`linkAfter`** (`item`: `Linkable`)
Links the item to come after the given one.

#### `void` **`linkBefore`** (`item`: `Linkable`)
Links the item to come before the given one.

#### `Linkable` **`unlink`** ()
Unlinks the item by linking the `prev` and `next` together (when available) and returns `this`.
