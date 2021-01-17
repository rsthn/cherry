/*
**	@rsthn/cherry/quadtree
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

const { Class } = require('@rsthn/rin');
const List = require('./list');
const QuadTreeNode = require('./quadtree-node');
const QuadTreeItem = require('./quadtree-item');

/**
**	Implemention of a quad tree for optimized storage of spatial items.
*/

const QuadTree = module.exports = Class.extend
({
	/**
	**	Name of the class (for inheritance purposes).
	*/
	className: "QuadTree",

	/**
	**	Root node of the tree.
	*/
	root: null, /*QuadTreeNode*/

	/**
	**	List of all inserted items, linearly grouped by node.
	*/
	items: null, /*List<QuadTreeItem>*/

	/**
	**	List of items ordered by their position from back to front.
	*/
	orderedItems: null, /*List<QuadTreeItem>*/

	/**
	**	Queue of items to be updated on the next update cycle.
	*/
	updateQueue: null, /*List<QuadTreeItem>*/

	/**
	**	Maximum number of items per each node.
	*/
	nodeCapacity: 0,

	/**
	**	Node pointing to the next selected item.
	*/
	nextItem: null, /*Linkable<QuadTreeItem>*/

	/**
	**	Direction of traversal of selected items, forward (false) or backward (true).
	*/
	isReverse: false,

	/**
	**	Indicates if the quad tree layer is visible.
	*/
	visible: true,

	/**
	**	Direction of the X, Y and Z coordinates (true=inverted). Used to alter ordering of items in the quad tree.
	*/
	xd: false, yd: false, zd: false,

	/**
	**	Constructs a quad tree for the specified region.
	*/
	__ctor: function (x1, y1, x2, y2, nodeCapacity)
	{
		this.items = new List ();
		this.orderedItems = new List ();
		this.updateQueue = new List ();

		this.root = new QuadTreeNode (this, x1, y1, x2, y2);
		this.nodeCapacity = nodeCapacity;

		this.isReverse = false;
		this.visible = true;

		this.fnComparator = this.COMPARATOR_DEFAULT_YX;
	},

	/**
	**	Destructs the tree, all nodes and all items.
	*/
	__dtor: function ()
	{
		this.root.clear();
		dispose(this.root);

		dispose(this.items);
		dispose(this.orderedItems);
		dispose(this.updateQueue);
	},

	/**
	**	Returns the extents of the quad tree.
	*/
	getExtents: function () /*Rect*/
	{
		return this.root.getExtents();
	},

	/**
	**	Sets the visibility of the QuadTree.
	*/
	setVisible: function (value)
	{
		this.visible = value;
		return this;
	},

	/**
	**	Returns the visibility of the QuadTree.
	*/
	getVisible: function ()
	{
		return this.visible;
	},

	/**
	**	Removes (and destroys) all items and all nodes from the tree.
	*/
	clear: function ()
	{
		this.root.clear();

		this.orderedItems.reset();
		this.updateQueue.reset();
	},

	/**
	**	Sets the direction of the x, y or z axis.
	*/
	setXd: function (value) { if (this.xd == value) return false; this.xd = value; return true; },
	setYd: function (value) { if (this.yd == value) return false; this.yd = value; return true; },
	setZd: function (value) { if (this.zd == value) return false; this.zd = value; return true; },

	/**
	**	Returns the sign of the x, y or z axis.
	*/
	getXd: function() { return this.xd; },
	getYd: function() { return this.yd; },
	getZd: function() { return this.zd; },

	/**
	**	Returns true if "a" should be drawn before "b".
	*/
	fnComparator: null,

	/**
	**	Sets the comparator function used to determine the drawing order of items. Returns false if the provided comparator
	**	is the same as the one currently being used.
	*/
	setComparator: function (fnComparator)
	{
		if (this.fnComparator == fnComparator)
			return false;

		this.fnComparator = fnComparator;
		return true;
	},

	/**
	**	Returns true if "a" should be drawn before "b". Uses 2D-grid comparison. Z-Index specifies a virtual layer.
	*/
	COMPARATOR_DEFAULT_YX: function (a, b, p, q)
	{
		return ((p.zindex<q.zindex)^this.zd) || (p.zindex==q.zindex && (((a.y1<b.y1)^this.yd) || (a.y1==b.y1 && ((a.x1<b.x1)^this.xd))));
	},

	/**
	**	Returns true if "a" should be drawn before "b". Uses 2D-grid comparison. Z-Index specifies a virtual layer.
	*/
	COMPARATOR_DEFAULT_XY: function (a, b, p, q)
	{
		return ((p.zindex<q.zindex)^this.zd) || (p.zindex==q.zindex && (((a.x1<b.x1)^this.xd) || (a.x1==b.x1 && ((a.y1<b.y1)^this.yd))));
	},

	/**
	**	Returns true if "a" should be drawn before "b". Uses Manhattan distance function. Z-Index specifies a virtual layer.
	*/
	COMPARATOR_MANHATTAN: function (a, b, p, q)
	{
		return ((p.zindex < q.zindex) ^ this.zd) || (p.zindex == q.zindex && (a.cx + a.cy < b.cx + b.cy));
	},

	/**
	**	Returns true if "a" should be drawn before "b" by comparing only the Y2 component. The Z-Index is arithmetically added to the Y2 value.
	*/
	COMPARATOR_Y2: function (a, b, p, q)
	{
		return ((p.zindex<q.zindex)^this.zd) || (p.zindex==q.zindex && (((a.y2<b.y2)^this.yd) || (a.y2==b.y2 && (a.x1<=b.x1)^this.xd)));
	},

	/**
	**	Returns true if "a" should be drawn before "b" by comparing only the Y-axis. The Z-Index is arithmetically added to the Y1 value.
	*/
	COMPARATOR_Y1: function (a, b, p, q)
	{
		return ((a.y1 + p.zindex) < (b.y1 + q.zindex)) ^ this.yd;
	},

	/**
	**	Returns true if "a" should be drawn before "b" by comparing only the Y-axis. The Z-Index is arithmetically added to the X2 value.
	*/
	COMPARATOR_X2: function (a, b, p, q)
	{
		return ((a.x2 + p.zindex) < (b.x2 + q.zindex)) ^ this.xd;
	},

	/**
	**	Returns true if "a" should be drawn before "b" by comparing only the Y-axis. The Z-Index is arithmetically added to the X1 value.
	*/
	COMPARATOR_X1: function (a, b, p, q)
	{
		return ((a.x1 + p.zindex) < (b.x1 + q.zindex)) ^ this.xd;
	},

	/**
	**	Used for internal ordering. Returns true if item P is before item Q by comparing their position.
	*/
	isBefore: function (/*QuadTreeItem*/p, /*QuadTreeItem*/q)
	{
		return this.fnComparator(p.getLBounds(), q.getLBounds(), p, q);
	},

	/**
	**	Adds an item to the ordered list.
	*/
	addItemOrdered: function (/*QuadTreeItem*/item)
	{
		for (var i = this.orderedItems.top; i; i = i.next)
		{
			if (this.isBefore (item, i.value))
			{
				this.orderedItems.insertBefore (i, item);
				return;
			}
		}

		this.orderedItems.push (item);
	},

	/**
	**	Reorders the ordered-items-list using the current comparator. Should be called after changing the comparator or the axes sign.
	*/
	reorderItems: function ()
	{
		var tmp = this.orderedItems;

		this.orderedItems = new List ();

		for (var i = tmp.top; i; i = i.next)
		{
			this.addItemOrdered(i.value);
		}

		dispose(tmp);
	},

	/**
	**	Adds an item to the tree, returns false if the operation was unsuccessful.
	*/
	addItem: function (/*QuadTreeItem*/item) /*bool*/
	{
		if (this.root.addItem (item, this.nodeCapacity))
		{
			this.addItemOrdered (item);
			return true;
		}

		return false;
	},

	/**
	**	Removes an item from the tree. Returns false if the operation was unsuccessful.
	*/
	removeItem: function (/*QuadTreeItem*/item) /*bool*/
	{
		if (!(item.flags & QuadTreeItem.FLAG_ATTACHED))
			return true;

		if (!this.root.removeItem (item))
			return false;

		this.orderedItems.remove (this.orderedItems.sgetNode (item));
		return true;
	},

	/**
	**	Adds an item to the update queue to be processed on the next update cycle.
	*/
	updateItem: function (/*QuadTreeItem*/item)
	{
		this.removeItem (item);

		if (!this.addItem (item))
		{
			dispose(item, 'QuadTree::updateItem');
			return;
		}

		if (item.flags & QuadTreeItem.FLAG_QUEUED)
			return;

		this.updateQueue.push (item);
		item.flags |= QuadTreeItem.FLAG_QUEUED;
	},

	/**
	**	Runs an update cycle on the tree. Any queued item will be updated.
	*/
	update: function()
	{
		var i;

		while (i = this.updateQueue.pop())
		{
			i.flags &= ~QuadTreeItem.FLAG_QUEUED;
			i.notifyPosition();
		}
	},

	/**
	**	Returns the list of ordered items.
	*/
	getItems: function () /*List<QuadTreeItem>*/
	{
		return this.orderedItems;
	},

	/**
	**	Sets the reverse-flag to report selected items from front-to-back (true) or back-to-front (false).
	*/
	setReverse: function (value) /*QuadTree*/
	{
		this.isReverse = value;
		return this;
	},

	/**
	**	Selects all items that are within the specified region.
	*/
	selectItems: function (/*Rect*/rect, isReverse=null)
	{
		if (isReverse === null)
			isReverse = this.isReverse;

		this.root.selectItems (rect);
		this.nextItem = isReverse ? this.orderedItems.bottom : this.orderedItems.top;
	},

	/**
	**	Returns the next selected item in the list or null if the end has been reached.
	*/
	getNextSelectedItem: function (isReverse=null) /*QuadTreeItem*/
	{
		if (isReverse === null)
			isReverse = this.isReverse;

		while (this.nextItem != null && !(this.nextItem.value.flags & QuadTreeItem.FLAG_SELECTED))
		{
			this.nextItem = isReverse ? this.nextItem.prev : this.nextItem.next;
		}

		var ret = this.nextItem;

		if (this.nextItem)
		{
			this.nextItem.value.flags &= ~QuadTreeItem.FLAG_SELECTED;
			this.nextItem = isReverse ? this.nextItem.prev : this.nextItem.next;
		}

		return ret ? ret.value : null;
	},

	/**
	**	Detects collisions between items and executes the methods of the specified handler. The context variable is
	**	passed as-is to the handler routines. The handler should implement methods:
	**
	**	bool onFilterRequest (item, context)
	**	bool onCollision (a, b, context)
	*/
	detectCollisions: function (/*IQuadTreeHandler*/handler, context)
	{
		var attempts = 16;

		while (this.root.isDirty && --attempts != 0)
			this.root.detectCollisions (handler, context);

		if (attempts == 0)
			console.log("Error: Collision detection generated an unresolved state.");
	}
});
