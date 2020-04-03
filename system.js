/*
**	@rsthn/cherry/system
**
**	Copyright (c) 2016-2020, RedStar Technologies, All rights reserved.
**	https://www.rsthn.com/
**
**	THIS LIBRARY IS PROVIDED BY REDSTAR TECHNOLOGIES "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
**	INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A 
**	PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL REDSTAR TECHNOLOGIES BE LIABLE FOR ANY
**	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT 
**	NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; 
**	OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, 
**	STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
**	USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

require('./globals');

const KeyCodes = require('./keycodes');
const List = require('./list');
const Linkable = require('./linkable');
const Timer = require('./timer');
const Canvas = require('./canvas');

/**
**	System object.
*/

const System = module.exports =
{
	/**
	**	System flags.
	*/
	flags:
	{
		renderingEnabled: false,
		renderingPaused: false
	},

	/**
	**	Event codes.
	*/
	EVT_KEY_DOWN:			0x001,
	EVT_KEY_UP:				0x002,

	EVT_POINTER_DOWN: 		0x010,
	EVT_POINTER_UP: 		0x011,
	EVT_POINTER_MOVE: 		0x012,
	EVT_POINTER_DRAG_START:	0x013,
	EVT_POINTER_DRAG_MOVE:	0x014,
	EVT_POINTER_DRAG_STOP:	0x015,

	/**
	**	Display orientations.
	*/
	DEFAULT:	0,
	LANDSCAPE:	1,
	PORTRAIT:	2,
	AUTOMATIC:	3,

	/**
	**	Default options of the rendering system.
	*/
	defaultOptions:
	{
		background: "#000",

		fps: 60,
		minFps: 15,

		context: null,
		antialias: true,

		targetScreenWidth: null,
		targetScreenHeight: null,
		orientation: 0,

		extraScaleFactor: 1,
		fullscreen: true
	},

	/**
	**	Screen resolution, obtained automatically when the system is initialized.
	*/
	screenWidth: 0, screenHeight: 0,

	/**
	**	Coordinates of the screen's offset (for letter-box effect when the screen does not fit tightly).
	*/
	offsX: 0, offsY: 0,

	/**
	**	Device pixel ratio, canvas backing store ratio and resulting canvas ratio (devicePixelRatio / backingStoreRatio).
	*/
	devicePixelRatio: 1, backingStoreRatio: 1, canvasPixelRatio: 1, canvasScaleFactor: 1, scaleFactor: 1,

	/*
	**	Initial transformation matrix. Should be used (if needed) instead of loadIdentity() since the System does some transformations first.
	*/
	initialMatrix: null,

	/**
	**	Display buffer for the renderer.
	*/
	displayBuffer: null,

	/**
	**	Small (320x240) temporal display buffer.
	*/
	tempDisplayBuffer: null,

	/**
	**	Context for the update and draw handlers.
	*/
	context: null,

	/**
	**	Map with the status of all keys.
	*/
	keyState: { },

	/**
	**	Event arguments for the keyboard events.
	*/
	keyEvtArgs: { shift: false, ctrl: false, alt: false, keyCode: 0, keyState: null },

	/**
	**	Current status of all pointers. The related object is known as the Pointer State, and has the following fields:
	**	id, isActive, isDragging, sx, sy, x, y, dx, dy, button
	*/
	pointerState: { },

	/**
	**	The update method of all objects will be executed when the system update() method is called.
	*/
	updateQueue: null, /*List*/

	/**
	**	The draw method of all objects will be executed when the system draw() method is called.
	*/
	drawQueue: null, /*List*/

	/*
	**	Time scale, the frame delta is multiplied by this value before each system cycle.
	*/
	timeScale: 1,

	/**
	**	Frame interval in milliseconds.
	*/
	frameInterval: 0,

	/**
	**	Fixed frame interval in milliseconds, when set to non-zero value the frame delta will be set to this value.
	*/
	fixedFrameInterval: 0,

	/**
	**	Maximum frame interval in milliseconds, if the frameDelta exceeds this it will be truncated to this value.
	*/
	maxFrameInterval: 0,

	/**
	**	Last frame delta in seconds and milliseconds (float, int).
	*/
	frameDelta: 0,
	frameDeltaMillis: 0,

	/**
	**	Logical system time (updated on each cycle by the calculated frameDelta).
	*/
	frameTime: 0,
	frameTimeMillis: 0,

	/**
	**	Current frame number.
	*/
	frameNumber: 0,

	/**
	**	Indicates if the drawing or update process is taking place.
	*/
	frameUpdateInProgress: false,
	frameDrawInProgress: false,

	/**
	**	Rendering time data.
	*/
	perf:
	{
		/**
		**	Time of the first frame drawn.
		*/
		startTime: 0,

		/**
		**	Time of the last frame drawn.
		*/
		lastTime: 0,

		/**
		**	Number of frames drawn in total since startTime.
		*/
		numFrames: 0,

		/**
		**	Total time accumulated in each update and draw operation.
		*/
		updateTime: 0,
		drawTime: 0
	},

	/**
	**	Initializes the system with the specified configuration.
	*/
	init: function (opts)
	{
		// Load options from defaults and from the specified ones.
		var o = { };

		Object.assign(o, this.defaultOptions);
		if (opts) Object.assign(o, opts);

		this.options = o;

		// Set default orientation if both target sizes were specified.
		if (o.targetScreenWidth && o.targetScreenHeight && o.orientation == System.DEFAULT)
		{
			o.orientation = o.targetScreenWidth > o.targetScreenHeight ? System.LANDSCAPE : System.PORTRAIT;
		}

		// Load some options into the system.
		this.context = o.context;
		this.orientation = o.orientation;

		this.updateQueue = new List();
		this.drawQueue = new List();

		// Attach frame event handlers.
		this.frameInterval = int(1000 / o.fps);
		this.maxFrameInterval = int(1000 / o.minFps);

		global.onresize = this.onWindowResized.bind(this);

		this.frameTimer = new Timer (this.frameInterval, this.onFrame, this);

		// Setup canvas buffer.
		this.displayBuffer = new Canvas (null, { hidden: false, antialias: o.antialias, background: o.background });
		this.tempDisplayBuffer = new Canvas (null, { hidden: true, antialias: o.antialias }).resize(320, 240);

		var display0 = this.displayBuffer.elem;

		// Obtain device display ratios.
		this.devicePixelRatio = global.devicePixelRatio || 1;

		this.backingStoreRatio = this.displayBuffer.context.webkitBackingStorePixelRatio ||
									this.displayBuffer.context.mozBackingStorePixelRatio ||
									this.displayBuffer.context.msBackingStorePixelRatio ||
									this.displayBuffer.context.oBackingStorePixelRatio ||
									this.displayBuffer.context.backingStorePixelRatio || 1;

		this.canvasPixelRatio = this.devicePixelRatio / this.backingStoreRatio;

		System.onWindowResized (true);

		// Attach keyboard event handlers.
		this.keyState = { };
		this.keyEvtArgs = { shift: false, ctrl: false, alt: false, keyCode: 0, keyState: this.keyState };

		var _this = this;

		global.onkeydown = function (evt)
		{
			if (evt.target !== global.document.body)
				return;

			if (_this.keyState[evt.keyCode])
				return false;

			_this.keyState[evt.keyCode] = true;

			_this.keyEvtArgs.keyCode = evt.keyCode;

			switch (evt.keyCode)
			{
				case 16: // SHIFT
					_this.keyEvtArgs.shift = true;
					break;

				case 17: // CTRL
					_this.keyEvtArgs.ctrl = true;
					break;

				case 18: // ALT
					_this.keyEvtArgs.alt = true;
					break;
			}

			// CTRL+TAB should always be handled by the browser.
			if (_this.keyEvtArgs.ctrl && evt.keyCode == KeyCodes.TAB)
			{
				_this.keyState[evt.keyCode] = false;
				return true;
			}

			if (_this.onKeyboardEvent (_this.EVT_KEY_DOWN, evt.keyCode, _this.keyEvtArgs) === false)
				return false;
		};

		global.onkeyup = function (evt)
		{
			if (evt.target !== global.document.body)
				return;

			if (!_this.keyState[evt.keyCode])
				return false;

			_this.keyState[evt.keyCode] = false;

			_this.keyEvtArgs.keyCode = evt.keyCode;

			switch (evt.keyCode)
			{
				case 16: // SHIFT
					_this.keyEvtArgs.shift = false;
					break;

				case 17: // CTRL
					_this.keyEvtArgs.ctrl = false;
					break;

				case 18: // ALT
					_this.keyEvtArgs.alt = false;
					break;
			}

			if (_this.onKeyboardEvent (_this.EVT_KEY_UP, evt.keyCode, _this.keyEvtArgs) === false)
				return false;
		};

		// Attach pointer event handlers if pointer-events are available.
		if ("ontouchstart" in global)
		{
			display0.ontouchstart = function (evt)
			{
				evt.preventDefault();

				var touches = evt.changedTouches;

				for (var i = 0; i < touches.length; i++)
				{
					if (!System.pointerState[touches[i].identifier])
					{
						System.pointerState[touches[i].identifier] = {
								id: touches[i].identifier, isActive: false, isDragging: false,
								sx: 0, sy: 0, x: 0, y: 0, dx: 0, dy: 0, button: 0
							};
					}

					var p = System.pointerState[touches[i].identifier];

					p.isActive = true;
					p.isDragging = false;
					p.button = 1;

					p.startTime = System.now(true);

					p.x = p.sx = System.reverseRender ? ~~((touches[i].clientY-System.offsY) / System.canvasScaleFactor) : ~~((touches[i].clientX-System.offsX) / System.canvasScaleFactor);
					p.y = p.sy = System.reverseRender ? ~~(System.screenHeight - (touches[i].clientX-System.offsX) / System.canvasScaleFactor - 1) : ~~((touches[i].clientY-System.offsY) / System.canvasScaleFactor);

					System.onPointerEvent (System.EVT_POINTER_DOWN, p, System.pointerState);
				}

				return false;
			};

			display0.ontouchend = function (evt)
			{
				evt.preventDefault();

				var touches = evt.changedTouches;

				for (var i = 0; i < touches.length; i++)
				{
					if (!System.pointerState[touches[i].identifier])
						continue;

					var p = System.pointerState[touches[i].identifier];

					p.endTime = System.now(true);
					p.deltaTime = p.endTime - p.startTime;

					p.x = System.reverseRender ? ~~((touches[i].clientY-System.offsY) / System.canvasScaleFactor) : ~~((touches[i].clientX-System.offsX) / System.canvasScaleFactor);
					p.y = System.reverseRender ? ~~(System.screenHeight - (touches[i].clientX-System.offsX) / System.canvasScaleFactor - 1) : ~~((touches[i].clientY-System.offsY) / System.canvasScaleFactor);

					if (p.isDragging)
						System.onPointerEvent (System.EVT_POINTER_DRAG_STOP, p, System.pointerState);

					System.onPointerEvent (System.EVT_POINTER_UP, p, System.pointerState);

					p.isActive = false;
					p.isDragging = false;
					p.button = 0;
				}

				return false;
			};

			display0.ontouchcancel = function (evt)
			{
				evt.preventDefault();

				var touches = evt.changedTouches;

				for (var i = 0; i < touches.length; i++)
				{
					if (!System.pointerState[touches[i].identifier])
						continue;

					var p = System.pointerState[touches[i].identifier];

					p.x = System.reverseRender ? ~~((touches[i].clientY-System.offsY) / System.canvasScaleFactor) : ~~((touches[i].clientX-System.offsX) / System.canvasScaleFactor);
					p.y = System.reverseRender ? ~~(System.screenHeight - (touches[i].clientX-System.offsX) / System.canvasScaleFactor - 1) : ~~((touches[i].clientY-System.offsY) / System.canvasScaleFactor);

					System.onPointerEvent (p.isDragging ? System.EVT_POINTER_DRAG_STOP : System.EVT_POINTER_UP, p, System.pointerState);

					p.isActive = false;
					p.isDragging = false;
					p.button = 0;
				}

				return false;
			};

			display0.ontouchmove = function (evt)
			{
				evt.preventDefault();

				var touches = evt.changedTouches;

				for (var i = 0; i < touches.length; i++)
				{
					if (!System.pointerState[touches[i].identifier])
						continue;

					var p = System.pointerState[touches[i].identifier];

					if (p.isActive && !p.isDragging)
					{
						System.onPointerEvent (System.EVT_POINTER_DRAG_START, p, System.pointerState);
						p.isDragging = true;
					}

					p.x = System.reverseRender ? ~~((touches[i].clientY-System.offsY) / System.canvasScaleFactor) : ~~((touches[i].clientX-System.offsX) / System.canvasScaleFactor);
					p.y = System.reverseRender ? ~~(System.screenHeight - (touches[i].clientX-System.offsX) / System.canvasScaleFactor - 1) : ~~((touches[i].clientY-System.offsY) / System.canvasScaleFactor);

					p.dx = p.x - p.sx;
					p.dy = p.y - p.sy;

					System.onPointerEvent (p.isDragging ? System.EVT_POINTER_DRAG_MOVE : System.EVT_POINTER_MOVE, p, System.pointerState);
				}

				return false;
			};
		}
		// Attach mouse event handlers when pointer-events are not available.
		else
		{
			display0.onmousedown = function (evt)
			{
				evt.preventDefault();

				if (!System.pointerState[0])
				{
					System.pointerState[0] = {
							id: 0, isActive: false, isDragging: false, button: 0,
							sx: 0, sy: 0, x: 0, y: 0, dx: 0, dy: 0,
						};
				}

				var p = System.pointerState[0];

				p.isActive = true;
				p.isDragging = false;
				p.button = evt.which;

				p.x = p.sx = System.reverseRender ? ~~((evt.clientY-System.offsY) / System.canvasScaleFactor) : ~~((evt.clientX-System.offsX) / System.canvasScaleFactor);
				p.y = p.sy = System.reverseRender ? ~~(System.screenHeight - (evt.clientX-System.offsX) / System.canvasScaleFactor - 1) : ~~((evt.clientY-System.offsY) / System.canvasScaleFactor);

				System.onPointerEvent (System.EVT_POINTER_DOWN, p, System.pointerState);

				return false;
			};

			display0.onmouseup = function (evt)
			{
				evt.preventDefault();

				if (!System.pointerState[0])
					return false;

				var p = System.pointerState[0];

				p.x = System.reverseRender ? ~~((evt.clientY-System.offsY) / System.canvasScaleFactor) : ~~((evt.clientX-System.offsX) / System.canvasScaleFactor);
				p.y = System.reverseRender ? ~~(System.screenHeight - (evt.clientX-System.offsX) / System.canvasScaleFactor - 1) : ~~((evt.clientY-System.offsY) / System.canvasScaleFactor);

				if (p.isDragging)
					System.onPointerEvent (System.EVT_POINTER_DRAG_STOP, p, System.pointerState);

				System.onPointerEvent (System.EVT_POINTER_UP, p, System.pointerState);

				p.isActive = false;
				p.isDragging = false;
				p.button = 0;
			};

			display0.onmousemove = function (evt)
			{
				evt.preventDefault();

				if (!System.pointerState[0])
					return false;

				var p = System.pointerState[0];

				if (p.isActive && !p.isDragging)
				{
					System.onPointerEvent (System.EVT_POINTER_DRAG_START, p, System.pointerState);
					p.isDragging = true;
				}

				p.x = System.reverseRender ? ~~((evt.clientY-System.offsY) / System.canvasScaleFactor) : ~~((evt.clientX-System.offsX) / System.canvasScaleFactor);
				p.y = System.reverseRender ? ~~(System.screenHeight - (evt.clientX-System.offsX) / System.canvasScaleFactor - 1) : ~~((evt.clientY-System.offsY) / System.canvasScaleFactor);

				p.dx = p.x - p.sx;
				p.dy = p.y - p.sy;

				System.onPointerEvent (p.isDragging ? System.EVT_POINTER_DRAG_MOVE : System.EVT_POINTER_MOVE, p, System.pointerState);

				return false;
			};
		}
	},

	/**
	**	Returns the current time in milliseconds or seconds if asSeconds is set to true.
	*/
	now: function(asSeconds)
	{
		var value = hrnow();
		return asSeconds ? (value / 1000) : value;
	},

	/**
	**	Returns the current logical time in seconds (same as reading System.frameTime).
	*/
	time: function()
	{
		return this.frameTime;
	},

	/**
	**	Starts the system and enables rendering and updates.
	*/
	start: function()
	{
		this.onWindowResized();

		this.flags.renderingPaused = false;
		this.frameTimer.start();
	},

	/**
	**	Stops the system by disabling both rendering and updates.
	*/
	stop: function()
	{
		this.flags.renderingPaused = true;
		this.frameTimer.stop();
	},

	/**
	**	Disables updates, but continues to render.
	*/
	pause: function()
	{
		this.flags.renderingPaused = true;
	},

	/**
	**	Resumes updates if previously stopped with `pause()`.
	*/
	resume: function()
	{
		this.flags.renderingPaused = false;
		this.resetPerf();
	},

	/**
	**	Executed when a frame needs to be rendered to the display buffer.
	*/
	onFrame: function(delta, timer)
	{
		var now = this.now();
		var tmp;

		if (delta > this.maxFrameInterval)
			delta = this.maxFrameInterval;

		if (this.fixedFrameInterval != 0)
			delta = this.fixedFrameInterval;

		if (!this.flags.renderingEnabled || this.flags.renderingPaused)
		{
			this.frameDrawInProgress = true;
			try {
				this.draw (this.displayBuffer, this.context);
			}
			catch (e) {
				console.error("DRAW ERROR: \n" + e + "\n" + e.stack);
			}	
			this.frameDrawInProgress = false;
			return;
		}

		if (this.perf.numFrames == 0)
		{
			this.perf.startTime = now - this.frameInterval;
			this.perf.lastTime = now;
		}

		delta *= this.timeScale;

		this.frameDeltaMillis = delta;
		this.frameDelta = delta / 1000.0;
		this.frameTimeMillis += this.frameDeltaMillis;
		this.frameTime += this.frameDelta;
		this.frameNumber++;

		/* ~ */
		this.frameUpdateInProgress = true;
		tmp = hrnow();
		try {
			this.update (delta, this.context);
		}
		catch (e) {
			console.error("UPDATE ERROR: " + e + "\n" + e.stack);
			System.stop();
		}
		this.perf.updateTime += hrnow() - tmp;
		this.frameUpdateInProgress = false;

		/* ~ */
		this.frameDrawInProgress = true;
		tmp = hrnow();
		try {
			this.draw (this.displayBuffer, this.context);
		}
		catch (e) {
			console.error("DRAW ERROR: \n" + e + "\n" + e.stack);
			System.stop();
		}	
		this.perf.drawTime += hrnow() - tmp;
		this.frameDrawInProgress = false;

		this.perf.lastTime = now;
		this.perf.numFrames++;
	},

	/**
	**	Executed when the size of the window has changed. Will cause a full buffer rendering.
	*/
	onWindowResized: function(notRendering)
	{
		if ('document' in global)
		{
			if (this.options.fullscreen)
			{
				this._screenWidth = int(global.screen.width);
				this._screenHeight = int(global.screen.height);
			}
			else
			{
				this._screenWidth = global.innerWidth;
				this._screenHeight = global.innerHeight;
			}
		}
		else
		{
			this._screenWidth = this.options.targetScreenWidth;
			this._screenHeight = this.options.targetScreenHeight;
		}

		this.canvasScaleFactor = 1;

		if ((this._screenWidth < this._screenHeight && this.orientation == System.LANDSCAPE) || (this._screenWidth > this._screenHeight && this.orientation == System.PORTRAIT))
		{
			this.screenWidth = this._screenHeight;
			this.screenHeight = this._screenWidth;

			this.reverseRender = true;
		}
		else
		{
			this.screenWidth = this._screenWidth;
			this.screenHeight = this._screenHeight;

			this.reverseRender = false;
		}

		let targetScreenWidth = this.options.targetScreenWidth;
		let targetScreenHeight = this.options.targetScreenHeight;

		if (this.orientation == System.AUTOMATIC && targetScreenWidth && targetScreenHeight)
		{
			if ((targetScreenWidth > targetScreenHeight && this.screenWidth < this.screenHeight) || (targetScreenWidth < targetScreenHeight && this.screenWidth > this.screenHeight))
			{
				targetScreenWidth = targetScreenHeight;
				targetScreenHeight = this.options.targetScreenWidth;
			}
		}

		if (targetScreenWidth && targetScreenHeight)
		{
			this.canvasScaleFactor = Math.min (this.screenWidth / targetScreenWidth, this.screenHeight / targetScreenHeight);
		}
		else if (targetScreenWidth)
		{
			this.canvasScaleFactor = this.screenWidth / targetScreenWidth;
		}
		else if (targetScreenHeight)
		{
			this.canvasScaleFactor = this.screenHeight / targetScreenHeight;
		}

		var _screenWidth = this.screenWidth;
		var _screenHeight = this.screenHeight;

		if (targetScreenWidth) this.screenWidth = targetScreenWidth;
		if (targetScreenHeight) this.screenHeight = targetScreenHeight;

		this.offsX = int((_screenWidth - this.screenWidth*this.canvasScaleFactor)*0.5);
		this.offsY = int((_screenHeight - this.screenHeight*this.canvasScaleFactor)*0.5);

		if (this.reverseRender)
		{
			var tmp = this.offsX;
			this.offsX = this.offsY;
			this.offsY = tmp;
		}

		this.scaleFactor = this.canvasScaleFactor * this.canvasPixelRatio;
		this.scaleFactor = ~~(0.7 + this.scaleFactor);

		this.flags.renderingEnabled = false;

		if ('document' in global)
			global.document.body.style.backgroundColor = this.displayBuffer.backgroundColor;

			if (!this.reverseRender)
			{
				this.displayBuffer.resize (this.screenWidth*this.scaleFactor, this.screenHeight*this.scaleFactor);

				this.displayBuffer.elem.style.width = (this.screenWidth*this.canvasScaleFactor) + "px";
				this.displayBuffer.elem.style.height = (this.screenHeight*this.canvasScaleFactor) + "px";
			}
			else
			{
				this.displayBuffer.resize (this.screenHeight*this.scaleFactor, this.screenWidth*this.scaleFactor);

				this.displayBuffer.elem.style.width = (this.screenHeight*this.canvasScaleFactor) + "px";
				this.displayBuffer.elem.style.height = (this.screenWidth*this.canvasScaleFactor) + "px";
			}

			this.displayBuffer.elem.style.marginLeft = this.offsX + "px";
			this.displayBuffer.elem.style.marginTop = this.offsY + "px";

			this.displayBuffer.loadIdentity();

			if (this.scaleFactor != 1)
				this.displayBuffer.globalScale(this.scaleFactor);

			if (this.reverseRender)
			{
				this.displayBuffer.rotate(-Math.PI / 2);
				this.displayBuffer.translate(0, -this.screenHeight);

				this.displayBuffer.flipped(true);
			}

		this.scaleFactor *= this.options.extraScaleFactor;

		this.integerScaleFactor = ~~(this.scaleFactor + 0.9);
		this.resetPerf();

		this.initialMatrix = this.displayBuffer.getMatrix();

		if (notRendering != true)
		{
			this.flags.renderingEnabled = true;
			this.onCanvasResized (this.screenWidth, this.screenHeight);
		}
	},

	/**
	**	Event triggered when the canvas was resized by the system.
	*/
	onCanvasResized: function (screenWidth, screenHeight)
	{
	},

	/**
	**	Resets the performance data.
	*/
	resetPerf: function()
	{
		this.perf.numFrames = 0;
	},

	/**
	**	Adds the specified object to the update queue. Must have method update (deltaTime: int).
	*/
	updateQueueAdd: function (/*object*/obj)
	{
		this.updateQueue.push (obj);
		return this.updateQueue.bottom;
	},

	/**
	**	Removes the specified object from the update queue.
	*/
	updateQueueRemove: function (/*object*/obj)
	{
		this.updateQueue.remove (obj instanceof Linkable ? obj : this.updateQueue.sgetNode(obj));
	},

	/**
	**	Adds the specified object to the draw queue. Must have method draw (canvas: Canvas).
	*/
	drawQueueAdd: function (/*object*/obj)
	{
		this.drawQueue.push (obj);
		return this.drawQueue.bottom;
	},

	/**
	**	Removes the specified object from the draw queue.
	*/
	drawQueueRemove: function (/*object*/obj)
	{
		this.drawQueue.remove (obj instanceof Linkable ? obj : this.drawQueue.sgetNode(obj));
	},

	/**
	**	Adds the specified object to the update and draw queues. Must have both update (deltaTime: int) and draw (canvas: Canvas) methods. Returns `obj`.
	*/
	queueAdd: function (/*object*/obj)
	{
		this.updateQueue.push (obj);
		this.drawQueue.push (obj);
		return obj;
	},

	/**
	**	Removes the specified object from the update and draw queues.
	*/
	queueRemove: function (/*object*/obj)
	{
		this.updateQueue.remove (this.updateQueue.sgetNode(obj));
		this.drawQueue.remove (this.drawQueue.sgetNode(obj));
	},

	/**
	**	Runs an update cycle, all objects in the updateQueue will be updated.
	*/
	update: function (dt, context)
	{
		this.dt = dt;

		var next;

		for (var elem = this.updateQueue.top; elem; elem = next)
		{
			next = elem.next;
			elem.value.update(dt, context);
		}
	},

	/**
	**	Runs a rendering cycle, all objects in the drawQueue will be drawn.
	*/
	draw: function (canvas, context)
	{
		var next;

		for (var elem = this.drawQueue.top; elem; elem = next)
		{
			next = elem.next;
			elem.value.draw(canvas, context);
		}
	},

	/**
	**	Interpolates numeric values between two objects (`src` and `dst`) using the specified `duration` and `easing` function.
	*/
	interpolate: function (src, dst, duration, easing, callback/* function(data, isFinished) */)
	{
		let time = { };
		let data = { };
		let count = 0;

		for (let x in src)
		{
			time[x] = 0.0;
			data[x] = src[x]
			count++;
		}

		let interpolator =
		{
			update: function(dt)
			{
				dt /= 1000.0;

				for (let x in time)
				{
					if (time[x] == duration[x])
						continue;

					time[x] += dt;
					if (time[x] >= duration[x])
					{
						time[x] = duration[x];
						count--;
					}

					data[x] = src[x] + (dst[x] - src[x]) * easing[x] (time[x] / duration[x]);
				}

				callback (data, count == 0);

				if (count == 0)
					System.updateQueueRemove(interpolator);
			}
		};

		System.updateQueueAdd(interpolator);
		interpolator.update(0);
	},

	/**
	**	Event triggered when a keyboard event is detected by the system, `action` is one of the EVT_KEY_* constants,
	**	`keyCode` is one of the `KeyCodes` constants and `keys` a reference to `System.keyEvtArgs`.
	*/
	onKeyboardEvent: function (action, keyCode, keys)
	{
	},

	/**
	**	Event triggered when a pointer event is detected by the system, `action` is one of the EVT_POINTER_* constants,
	**	`pointer` contains the pointer state, and `pointers` a reference to `System.pointerState`.
	*/
	onPointerEvent: function (action, pointer, pointers)
	{
	}
};
