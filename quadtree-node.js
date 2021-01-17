/*
**	@rsthn/cherry/quadtree-node
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
const Rect = require('./rect');
const QuadTreeItem = require('./quadtree-item');

/**
**	Describes a node of the quad tree.
*/

const QuadTreeNode = module.exports = Class.extend
({
	/**
	**	Name of the class (for inheritance purposes).
	*/
	className: "QuadTreeNode",

	/**
	**	Region covered by this node.
	*/
	extents: null, /* Rect */

	/**
	**	Number of items stored in the node (and all of its sub-nodes).
	*/
	numItems: 0, /* int */

	/**
	**	Link to the first item of this node.
	*/
	insertionPoint: null,

	/**
	**	Sub-nodes of the node. If the node is a branch subNode will not be null.
	*/
	subNode: null, /* array[4] of QuadTreeNode */

	/**
	**	Indicates if the node or a sub-node is dirty.
	*/
	isDirty: false,

	/**
	**	Tree containing this node.
	*/
	tree: null,

	/**
	**	Constructs the tree node with the specified extents.
	*/
	__ctor: function (tree, x1, y1, x2, y2)
	{
		this.tree = tree;

		this.numItems = 0;
		this.isDirty = false;

		this.insertionPoint = null;
		this.subNode = null;

		this.extents = Rect.alloc(x1, y1, x2, y2);
	},

	/**
	**	Destroys the node and all child nodes. Items are not removed, use clear() to properly remove items.
	*/
	__dtor: function ()
	{
		if (this.subNode != null)
		{
			for (var i = 0; i < 4; i++)
				dispose(this.subNode[i]);

			this.subNode = null;
		}

		this.extents.dispose();
	},

	/**
	**	Removes all items and child nodes.
	*/
	clear: function ()
	{
		if (this.subNode != null)
		{
			for (var i = 0; i < 4; i++)
			{
				this.subNode[i].clear(this.tree.items);
				dispose(this.subNode[i]);
			}

			this.subNode = null;
			this.numItems = 0;
		}
		else
		{
			var j = null;

			for (var i = this.insertionPoint; i && this.numItems--; i = j)
			{
				j = i.next;

				var k = this.tree.items.remove(i);
				k.numRefNodes--;

				if (k.numRefNodes == 0)
				{
					k.notifyRemoved(this.tree);
					dispose(k);
				}
			}

			this.insertionPoint = null;
			this.numItems = 0;
		}
	},

	/**
	**	Returns the extents of the node (Rect).
	*/
	getExtents: function () /* Rect */
	{
		return this.extents;
	},

	/**
	**	Adds an item to the node or any of its sub-nodes. If the node exceeds the given capacity the node will be split in four sub-nodes.
	**	Returns false if the item could not added because (a) it is outside the extents of the tree or (b) the node cannot be split.
	*/
	addItem: function (/*QuadTreeItem*/item, /*int*/capacity) /* bool */
	{
		if (!item.getBounds().intersects(this.extents))
			return false;

		if (this.subNode != null)
		{
			var result = false;

			for (var i = 0; i < 4; i++)
				result |= this.subNode[i].addItem (item, capacity);

			if (result)
			{
				this.isDirty = true;
				this.numItems++;
			}

			return result;
		}

		if (this.numItems < capacity)
		{
			if (this.insertionPoint == null)
			{
				this.tree.items.push (item);
				this.insertionPoint = this.tree.items.bottom;
			}
			else
				this.tree.items.insertAfter (this.insertionPoint, item);

			this.isDirty = true;
			this.numItems++;

			if (item.numRefNodes == 0)
				item.notifyInserted(this.tree);

			item.numRefNodes++;
			return true;
		}

		if (this.extents.width() < 1 && this.extents.height() < 1)
		{
			console.log("Error: Unable to split node any further. Current size is "+this.extents.width()+" x "+this.extents.height());
			return false;
		}

		this.subNode = [
			new QuadTreeNode (this.tree, this.extents.x1, this.extents.y1, this.extents.cx, this.extents.cy),
			new QuadTreeNode (this.tree, this.extents.cx, this.extents.y1, this.extents.x2, this.extents.cy),
			new QuadTreeNode (this.tree, this.extents.x1, this.extents.cy, this.extents.cx, this.extents.y2),
			new QuadTreeNode (this.tree, this.extents.cx, this.extents.cy, this.extents.x2, this.extents.y2)
		];

		let n = this.numItems;
		this.numItems = 0;

		for (let i = 0; i < n; i++)
		{
			let tmp = this.insertionPoint.next;
			let cur = this.insertionPoint.value;

			cur.numRefNodes--;

			if (!this.addItem (cur, capacity))
			{
				console.log ("Error: Shouldn't have happened. Unable to insert item on a sub-node of a just-split node.");
			}

			this.tree.items.remove (this.insertionPoint);
			this.insertionPoint = tmp;
		}

		this.insertionPoint = null;

		return this.addItem (item, capacity);
	},

	/**
	**	Removes an item from the node and/or its sub-nodes. Returns false if the node was not found.
	*/
	removeItem: function (/*QuadTreeItem*/item)
	{
		if (!item.getInsertionBounds().intersects(this.extents))
			return false;

		if (this.subNode != null)
		{
			var result = false;

			for (var i = 0; i < 4; i++)
				result |= this.subNode[i].removeItem (item);

			if (result)
			{
				this.isDirty = true;
				this.numItems--;
			}

			return result;
		}

		var i = this.insertionPoint;
		var n = this.numItems;

		for (; i && n--; i = i.next)
		{
			if (i.value == item) break;
		}

		if (i == null) return false;

		this.isDirty = true;
		this.numItems--;

		item.numRefNodes--;

		if (i === this.insertionPoint)
			this.insertionPoint = this.numItems ? i.next : null;

		this.tree.items.remove(i);

		if (item.numRefNodes == 0)
			item.notifyRemoved(this.tree);

		return true;
	},

	/**
	**	Selects items inside the specified rect from the node and all sub-nodes.
	*/
	selectItems: function (/*Rect*/rect)
	{
		if (!rect.intersects(this.extents))
			return;

		if (this.subNode != null)
		{
			for (var i = 0; i < 4; i++)
				this.subNode[i].selectItems (rect);
		}
		else
		{
			var i = this.insertionPoint;
			var n = this.numItems;

			for (; i && n--; i = i.next)
			{
				if ((i.value.visible == true && i.value.getInsertionBounds().intersects(rect)) || (i.value.flags & QuadTreeItem.FLAG_ALWAYS_SELECT))
					i.value.flags |= QuadTreeItem.FLAG_SELECTED;
			}
		}
	},

	/**
	**	Finds all collisions and executes the specified handler. Before calling the handler the provided filter function will
	**	be used to determine if the two objects physically colliding actually represent a semantically correct collision.
	*/
	detectCollisions: function (/*IQuadTreeHandler*/handler, context)
	{
		if (!this.isDirty)
			return;

		this.isDirty = false;

		if (this.subNode != null)
		{
			for (var i = 0; i < 4; i++)
				this.subNode[i].detectCollisions (handler, context);

			return;
		}

		var n = this.numItems;
		var i_next;

		for (var i = this.insertionPoint; i && n > 1; i = i_next)
		{
			var i_next = i.next;
			var m = --n;

			if (i.value.visible == false)
				continue;

			if (!handler.onFilterRequest (i.value, context))
				continue;

			var rect = i.value.getLBounds();
			var j_next;

			for (var j = i.next; j && m-- > 0; j = j_next)
			{
				var j_next = j.next;

				if (j.value.visible == false)
					continue;

				if (!handler.onFilterRequest (j.value, context))
					continue;

				if (!j.value.getLBounds().intersects (rect))
					continue;

				// Following code is non-standard cherry. Required on JS because objects might be recycled.
				var iId = i.objectId;
				var jId = j.objectId;

				handler.onCollision (i.value, j.value, context);

				if (i.objectId != iId)
				{
					i_next = this.insertionPoint;
					n = this.numItems;
					break;
				}

				if (j.objectId != jId)
				{
					j_next = i.next;
					m = n;
					continue;
				}
			}
		}
	}
});
