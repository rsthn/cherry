/*
**	cherryjs/core/quadtreeitem
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

const Class = require('@rsthn/rin/class');
const Rect = require('./rect');

/**
**	Base class for items accepted by a QuadTree.
*/

const QuadTreeItem = module.exports = Class.extend
({
	/**
	**	Name of the class (for inheritance purposes).
	*/
	className: "QuadTreeItem",

	/**
	**	Boundaries at which the item was inserted.
	*/
	insertionBounds: null, /* Rect */

	/**
	**	Boundaries of the last known position that was correct.
	*/
	lastBounds: null, /* Rect */

	/**
	**	Current bounds of the element.
	*/
	bounds: null, /* Rect */

	/**
	**	Current logical bounds of the element for collision detection.
	*/
	lbounds: null, /* Rect */

	/**
	**	Type of the item.
	*/
	type: 0,

	/**
	**	Z-index (layer ordering) of the item.
	*/
	zindex: 0,

	/**
	**	Visibility of the item.
	*/
	visible: true,

	/**
	**	Flags of the item (see FLAG_* constants).
	*/
	flags: 0,

	/**
	**	Number of nodes referencing this item.
	*/
	numRefNodes: 0,

	/**
	**	Executed when the item is created.
	*/
	__ctor: function ()
	{
		this.insertionBounds = Rect.alloc();
		this.lastBounds = Rect.alloc();
		this.bounds = Rect.alloc();
		this.lbounds = Rect.alloc();

		this.numRefNodes = 0;
		this.zindex = 0;

		this.flags = QuadTreeItem.FLAG_INITIAL;
		this.type = 0;
		this.visible = true;
	},

	/**
	**	Resets the object to its initial state.
	*/
	__reinit: function ()
	{
		this.insertionBounds.zero();
		this.lastBounds.zero();
		this.bounds.zero();
		this.lbounds.zero();

		this.numRefNodes = 0;
		this.zindex = 0;

		this.flags = QuadTreeItem.FLAG_INITIAL;
		this.type = 0;
		this.visible = true;
	},

	/**
	**	Executed when the item is removed from the tree.
	*/
	__dtor: function ()
	{
	},

	/**
	**	Sets flag bits.
	*/
	setFlags: function (value)
	{
		this.flags |= value;
	},

	/**
	**	Clears flag bits.
	*/
	clearFlags: function (value)
	{
		this.flags &= ~value;
	},

	/**
	**	Returns the result of masking (bitwise AND) the flags by the specified flag bits.
	*/
	maskFlags: function (value)
	{
		return this.flags & value;
	},

	/**
	**	Sets the z-index of the item.
	*/
	setZIndex: function (value)
	{
		this.zindex = value;
		return this;
	},

	/**
	**	Returns the Z-index of the item.
	*/
	getZIndex: function ()
	{
		return this.zindex;
	},

	/**
	**	Executed when the item is inserted on the tree.
	*/
	notifyInserted: function ()
	{
		this.flags |= QuadTreeItem.FLAG_ATTACHED;
		this.insertionBounds.set (this.getBounds());

		if (this.flags & QuadTreeItem.FLAG_INITIAL)
		{
			this.flags &= ~QuadTreeItem.FLAG_INITIAL;
			this.lastBounds.set (this.getBounds());
		}
	},

	/**
	**	Executed when the item is removed from the tree.
	*/
	notifyRemoved: function ()
	{
		this.flags &= ~QuadTreeItem.FLAG_ATTACHED;
	},

	/**
	**	Executed when the item's position has been acnowledged.
	*/
	notifyPosition: function ()
	{
		this.lastBounds.set (this.getBounds());
	},

	/**
	**	Returns the rect with the insertion bounds.
	*/
	getInsertionBounds: function () /* Rect */
	{
		return this.insertionBounds;
	},

	/**
	**	Returns the rect with the last bounds.
	*/
	getLastBounds: function () /* Rect */
	{
		return this.lastBounds;
	},

	/**
	**	Returns the physical bounds of the item.
	*/
	getBounds: function () /* Rect */
	{
		return this.bounds;
	},

	/**
	**	Returns the logical bounds of the item (used for collision detection). The logical bounds must always be a sub-set
	**	of the physical bounds or collision detection might not work.
	*/
	getLBounds: function () /* Rect */
	{
		return this.lbounds;
	},

	/**
	**	Sets the type of the item.
	*/
	setType: function (type)
	{
		this.type = type;
		return this;
	},

	/**
	**	Returns the type of the item.
	*/
	getType: function ()
	{
		return this.type;
	},

	/**
	**	Sets the visibility of the item.
	*/
	setVisible: function (value)
	{
		this.visible = value;
		return this;
	},

	/**
	**	Returns the visibility of the item.
	*/
	getVisible: function ()
	{
		return this.visible;
	}
});

/**
**	Executed when the item is removed from the tree.
*/
QuadTreeItem.FLAG_QUEUED		=	1;
QuadTreeItem.FLAG_ATTACHED		=	2;
QuadTreeItem.FLAG_SELECTED		=	4;
QuadTreeItem.FLAG_INITIAL		=	8;
QuadTreeItem.FLAG_ALWAYS_SELECT	=	16;
QuadTreeItem.FLAG_USERDEF		=	32;
