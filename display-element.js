/*
**	@rsthn/cherry/display-element
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

const QuadTreeItem = require('./quadtree-item');
const Fragment = require('./fragment');
const List = require('./list');

/**
**	Describes a rectangular 2D display element.
*/

const DisplayElement = module.exports = QuadTreeItem.extend
({
	/**
	**	Name of the class (for inheritance purposes).
	*/
	className: "DisplayElement",

	/**
	**	Layer where the element is stored. Set internally by the setLayer() method, therefore using that method is required
	**	for correct behavior of this class.
	*/
	layer: null, /*QuadTree*/

	/**
	**	List of alternative collision areas (fragments) of the element. By default the element's bounds are used for collision
	**	detection, however when complex elements are needed additional collision areas can be defined using addCollisionFragment().
	*/
	fragments: null,

	/**
	**	Position of the element in world space.
	*/
	x: 0, y: 0,

	/**
	**	Position of the element in screen space.
	*/
	scrX: 0, scrY: 0,

	/**
	**	Constructs a display element with the specified dimensions.
	*/
	__ctor: function (width, height)
	{
		this._super.QuadTreeItem.__ctor();

		this.layer = null;
		this.setPosition (0, 0);

		this.bounds.resize (width, height);
		this.lbounds.resize (width, height);
	},

	/**
	**	Initializes the display element with the specified dimensions.
	*/
	__reinit: function (width, height)
	{
		this._super.QuadTreeItem.__reinit();

		this.layer = null;
		this.setPosition (0, 0);

		this.bounds.resize (width, height);
		this.lbounds.resize (width, height);
	},

	/**
	**	Destroys the element and all related resources.
	*/
	__dtor: function ()
	{
		if (this.fragments != null && this.layer != null)
		{
			for (let i = this.fragments.top; i; i = i.next)
				this.layer.removeItem(i.value);
		}

		if (this.fragments != null)
			dispose(this.fragments);

		if (this.layer != null)
			this.layer.removeItem (this);

		this._super.QuadTreeItem.__dtor();
	},

	/**
	**	More user-friendly function to destroy the display element. Same as calling __dtor() directly.
	*/
	dispose: function ()
	{
		this.__dtor();
	},

	/**
	**	Sets the layer of the element.
	*/
	setLayer: function (layer)
	{
		if (!layer) return this;

		if (this.layer != null)
		{
			this.layer.removeItem (this);

			if (this.fragments != null)
			{
				for (let i = this.fragments.top; i; i = i.next)
					this.layer.removeItem (i.value);
			}
		}

		if (this.fragments != null)
		{
			for (let i = this.fragments.top; i; i = i.next)
				this.layer.addItem (i.value);
		}

		return (this.layer = layer).addItem (this);
	},

	/**
	**	Sets the visibility of the display element (and all collision fragments).
	*/
	setVisible: function (value)
	{
		this._super.QuadTreeItem.setVisible (value);

		if (this.fragments != null)
		{
			for (let i = this.fragments.top; i; i = i.next)
				i.value.setVisible (value);
		}

		return this;
	},

	/**
	**	Adds a collision fragment to the element.
	*/
	addFragment: function (dx, dy, w, h)
	{
		if (this.fragments == null)
			this.fragments = new List();

		let fragment = new Fragment (this, dx, dy, w, h);
		this.fragments.push (fragment);

		if (this.layer != null)
			this.layer.addItem (fragment);

		return fragment;
	},

	/**
	**	Returns the number of collision fragments.
	*/
	getNumFragments: function()
	{
		return this.fragments != null ? this.fragments.count : 0;
	},

	/**
	**	Returns the list of collision fragments.
	*/
	getFragments: function()
	{
		return this.fragments;
	},

	/**
	**	Executed when the position changes to update the element bounds.
	*/
	onPositionChanged: function (x, y, zi)
	{
		var dx = x - this.bounds.cx;
		var dy = y - this.bounds.cy;
		var dzi = zi - this.zindex;

		this.x += dx;
		this.y += dy;
		this.zindex += dzi;

		this.scrX = this.x;
		this.scrY = this.y;

		this.bounds.translate (dx, dy);
		this.lbounds.translate (dx, dy);

		if (this.layer != null)
			this.layer.updateItem (this);

		if (this.fragments != null && this.layer != null)
		{
			for (let i = this.fragments.top; i; i = i.next)
			{
				i.value.translate (dx, dy);
				this.layer.updateItem (i.value);
			}
		}
	},

	/**
	**	Sets the position of the element.
	*/
	setPosition: function (x, y, dontUseCenter)
	{
		if (dontUseCenter === true)
		{
			x += this.bounds.cx - this.bounds.x1;
			y += this.bounds.cy - this.bounds.y1;
		}

		this.onPositionChanged(x, y, this.zindex);
		return this;
	},

	/**
	**	Returns the X-position of the element in screen-space.
	*/
	getScrX: function ()
	{
		return this.scrX;
	},

	/**
	**	Returns the Y-position of the element in screen-space.
	*/
	getScrY: function ()
	{
		return this.scrY;
	},

	/**
	**	Sets the X-position of the element.
	*/
	setX: function (x)
	{
		this.onPositionChanged(x, this.bounds.cy, this.zindex);
		return this;
	},

	/**
	**	Sets the Y-position of the element.
	*/
	setY: function (y)
	{
		this.onPositionChanged(this.bounds.cx, y, this.zindex);
		return this;
	},

	/**
	**	Returns the X-position of the element.
	*/
	getX: function ()
	{
		return this.x;
	},

	/**
	**	Returns the Y-position of the element.
	*/
	getY: function ()
	{
		return this.y;
	},

	/**
	**	Translates the element by the given deltas.
	*/
	translate: function (dx, dy, dzi=0)
	{
		this.onPositionChanged(this.bounds.cx+dx, this.bounds.cy+dy, this.zindex+dzi);
		return this;
	},

	/**
	**	Performs an update cycle of the element. Parameter dt is in seconds if added to World, or in milliseconds if added to System.
	*/
	update: function (dt)
	{
	},

	/**
	**	Draws the element on the specified canvas.
	*/
	draw: function (g)
	{
	}
});

DisplayElement.FLAG_FRAGMENT	= 1*QuadTreeItem.FLAG_USERDEF;
DisplayElement.FLAG_HOLLOW		= 2*QuadTreeItem.FLAG_USERDEF;

Object.assign(exports, module.exports);
