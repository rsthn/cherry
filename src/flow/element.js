/*
**	flow/element.js
**
**	Copyright (c) 2013-2021, RedStar Technologies, All rights reserved.
**	https://rsthn.com/
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

import { Class } from '@rsthn/rin';
import G from '../system/globals.js'
import Rect from '../math/rect.js'
import Anim from '../anim/anim.js';
import Matrix from '../math/matrix.js';
import Log from '../system/log.js';

/*
**
*/

export default Class.extend
({
	className: 'Element',

	/*
	**	Indicates if the element is visible, when set to `false`, the element will not be drawn.
	*/
	_visible: true,

	/*
	**	Indicates if the element is active, when set to `false` the element will not be updated.
	*/
	_active: true,

	/*
	**	Animation related to the element.
	*/
	anim: null,

	/*
	**	Parent element to whom this element is related.
	*/
	parent: null,

	/*
	**	Container where this element is stored, and its related node. If `container` is false, it means the element doesn't need a container.
	*/
	container: null,
	node: null,

	/*
	**	Element type. Can be used to differentiate between elements.
	*/
	type: 0,

	/*
	**	Element initial status.
	*/
	alpha: 1,
	angle: 0,
	x: 0, y: 0,
	sx: 1, sy: 1,
	width: 0, height: 0,

	/*
	**	Element hitbox in object and world space.
	*/
	hitbox: null,
	w_hitbox: null,

	/*
	**	Transformation matrix to place the object in world space.
	*/
	transform: null,
	transformDirty: false,

	/*
	**	Indicates if the bounds, or hitbox of the element should be drawn (for debugging purposes).
	*/
	debugBounds: false,
	debugHitbox: false,

	/*
	**	Constructor.
	*/
	__ctor: function(x=0, y=0, width=0, height=0)
	{
		this.anim = new Anim();
		this.anim.output(this);

		this.x = x;
		this.y = y;

		this.transform = new Matrix();

		this.hitbox = Rect.alloc();
		this.w_hitbox = Rect.alloc();

		this.resize(width, height);
		this.updateTransform(true);
	},

	/*
	**	Destructs the element.
	*/
	__dtor: function()
	{
		dispose (this.hitbox);
		dispose (this.w_hitbox);
		this.remove();
	},

	/*
	**	Sets or returns the visible flag.
	*/
	visible: function(value=null)
	{
		if (value === null)
		{
			if (this.container === null)
				return false;

			return this._visible && (this.parent != null ? this.parent.visible() : true);
		}

		this._visible = value;
		return this;
	},

	/*
	**	Sets or returns the active flag.
	*/
	active: function(value=null)
	{
		if (value === null)
			return this._active && (this.parent != null ? this.parent.active() : true);

		this._active = value;
		return this;
	},

	/*
	**	Sets the width and height of the element (and its hitbox).
	*/
	resize: function (width, height)
	{
		this.width = width;
		this.height = height;
		this.resizeHitbox (width, height);
	},

	/*
	**	Resizes the hitbox to the specified size. When normalized is `true`, values are from 0 to 1 relative to the width/height
	**	of the element respectively.
	*/
	resizeHitbox: function (width, height, normalized=false)
	{
		if (normalized)
		{
			width *= this.width;
			height *= this.height;
		}

		this.hitbox.zero();
		this.hitbox.translate (0, 0);
		this.hitbox.resizeBy (width, height, true);

		this.updateHitbox();
	},

	/*
	**	Updates the world-space hitbox.
	*/
	updateHitbox: function()
	{
		// violet: figure a way to optimize this
		let p0 = this.transform.applyTo(this.hitbox.x1, this.hitbox.y1);
		let p1 = this.transform.applyTo(this.hitbox.x1, this.hitbox.y2);
		let p2 = this.transform.applyTo(this.hitbox.x2, this.hitbox.y1);
		let p3 = this.transform.applyTo(this.hitbox.x2, this.hitbox.y2);

		this.w_hitbox.reset();
		this.w_hitbox.extendWithPoint(p0);
		this.w_hitbox.extendWithPoint(p1);
		this.w_hitbox.extendWithPoint(p2);
		this.w_hitbox.extendWithPoint(p3);
	},

	/*
	**	Updates the element's transformation matrix.
	*/
	updateTransform: function(immediate=false)
	{
		if (!immediate)
		{
			this.transformDirty = true;
			return;
		}

		/* ** */
		if (this.parent != null)
			this.transform.set(this.parent.transform);
		else
			this.transform.identity();

		this.transform.translate(this.x, this.y);

		if (this.sx != 0)
			this.transform.scale(this.sx, 1.0);

		if (this.sy != 0)
			this.transform.scale(1.0, this.sy);

		if (this.angle != 0)
		{
			this.transform.translate(0.5*this.width, 0.5*this.height);
			this.transform.rotate(this.angle);
		}

		this.transformDirty = false;

		/* ** */
		this.updateHitbox();
	},

	/*
	**	Sets the parent of the element.
	*/
	setParent: function(parent)
	{
		if (this.parent != null)
		{
		}

		this.parent = parent;
		if (!parent) return this;
	},

	/*
	**	Returns the X coordinate of the element, includes any offset introduced by the parent.
	*/
	getX: function()
	{
		return (this.parent != null ? this.parent.getX() : 0) + this._super.Element.getX();
	},

	/*
	**	Returns the Y coordinate of the element, includes any offset introduced by the parent.
	*/
	getY: function()
	{
		return (this.parent != null ? this.parent.getY() : 0) + this._super.Element.getY();
	},

	/*
	**	Applies the inverse transform of the element (including parent transform) to the specified point.
	*/
	inverseTransform: function (point)
	{
		if (this.parent != null)
			this.parent.inverseTransform (point);
//violet
		point.x -= this.x;
		point.y -= this.y;

		point.x /= this.sx;
		point.y /= this.sy;

		return point;
	},

	/*
	**	Changes the animation object of the element.
	*/
	setAnim: function (anim)
	{
		anim.clone(this.anim);
		return this;
	},

	/*
	**	Resets the animation object of the element.
	*/
	resetAnim: function (anim=null)
	{
		if (anim != null) this.setAnim (anim);
		this.anim.reset();
	},

	/*
	**	Adds the element to the specified container. Returns itself.
	*/
	addTo: function (container)
	{
		container.push(this);
		return this;
	},

	/*
	**	Removes the element from the container (and parent element).
	*/
	remove: function()
	{
		if (this.parent != null)
			this.parent.removeChild (this);

		if (this.container)
		{
			this.container.remove (this.node);
			this.container = null;
			// VIOLET: make container set null from Conatiner class when removed
		}

		return this;
	},

	/*
	**	Updates the position of the element in the container.
	*/
	updatePosition: function()
	{
		if (this.container)
			this.container.updatePosition(this);
	},

	/*
	**	Sets the position of the element.
	*/
	setPosition: function (x, y)
	{
		return this.translate(x - this.x, y - this.y);
	},

	/*
	**	Moves the element by the specified deltas.
	*/
	translate: function (dx, dy)
	{
		this.x += dx;
		this.y += dy;

		this.hitbox.translate (dx, dy);
		return this;
	},

	/*
	**	Applies the element's transform to the specified canvas.
	*/
	applyTransform: function(g)
	{
		g.appendMatrix(this.transform);

		if (this.alpha != 1.0)
			g.alpha(this.alpha);
	},

	/*
	**	Called before the `elementDraw` operation to ensure the canvas is transformed based on the element's state.
	*/
	preDraw: function(g)
	{
		g.pushMatrix();
		g.pushAlpha();

		this.applyTransform(g);
	},

	/*
	**	Called after the `elementDraw` operation to restore the canvas transform.
	*/
	postDraw: function(g)
	{
		if (G.debugBounds || this.debugBounds)
		{
			g.strokeStyle("yellow");
			g.strokeRect(0, 0, this.width, this.height);
		}

		g.popAlpha();
		g.popMatrix();

		if (G.debugHitbox || this.debugHitbox)
		{
			/*if (this.sensebox)
			{
				g.fillStyle("rgba(255,255,0,0.2)");
				g.fillRect(int(this.sensebox.x1), int(this.sensebox.y1), int(this.sensebox.width()), int(this.sensebox.height()));
			}*/

			if (!this.type)
				g.fillStyle("rgba(255,255,255,0.5)");
			else
				g.fillStyle("rgba(0,255,255,0.5)");

			/*if (this.highlight)
			{
				g.fillStyle("rgba(255,0,0,0.5)");
				this.highlight = false;
			}*/

			g.fillRect(int(this.w_hitbox.x1), int(this.w_hitbox.y1), int(this.w_hitbox.width()), int(this.w_hitbox.height()));
		}
	},

	/*
	**	Draws the element on the specified canvas. If the `_visible` flag is false, this method has no effect.
	*/
	draw: function(g)
	{
		if (!this.visible()) return; // violet: optimize by returning quick if elementDraw is the default one

		this.preDraw(g);
		this.elementDraw(g);
		this.postDraw(g);
	},

	/*
	**	Updates the element by the specified amount of time `dt` (seconds). If `_active` flag is false, this method has no effect.
	*/
	update: function(dt)
	{
		if (!this.active()) return;

		if (!this.anim.update(dt) || this.transformDirty)
		{
			this.updateTransform(true);
Log.vars.Y++;//violet
		}
		else
Log.vars.X++;//violet

		this.elementUpdate(dt);
	},

	/*
	**	Draws the element to the specified canvas. Ensure draw operations are done in model-space.
	*/
	elementDraw: function(g) /* @override */
	{
	},

	/*
	**	Updates the element. Parameter `dt` is the time delta measured in seconds.
	*/
	elementUpdate: function(dt) /* @override */
	{
	}
});
