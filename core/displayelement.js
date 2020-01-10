/*
**	cherryjs/core/displayelement
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

const QuadTreeItem = require('./quadtreeitem');

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
	**	Position of the element in world space.
	*/
	x: 0, y: 0,

	/**
	**	Position of the element in screen space.
	*/
	scrX: 0, scrY: 0,

	/**
	**	Layer where the element is stored.
	*/
	layer: null, /*QuadTree*/

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
		if (this.layer != null)
			this.layer.removeItem (this);

		this._super.QuadTreeItem.__dtor();
	},

	/**
	**	Sets the layer of the element.
	*/
	setLayer: function (layer)
	{
		if (!layer) return this;

		if (this.layer != null)
			this.layer.removeItem (this);

		return (this.layer = layer).addItem (this);
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
