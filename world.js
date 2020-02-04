/*
**	@rsthn/cherry/world
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

const Class = require('@rsthn/rin/class');
const Rect = require('./rect');
const List = require('./list');
const QuadTree = require('./quadtree');
const Viewport = require('./viewport');
const System = require('./system');
const DisplayElement = require('./display-element');

/**
**	Describes the container where all viewports and layers are stored.
*/

const World = module.exports = Class.extend
({
	/**
	**	Temporal object to get the bounds of the viewport.
	*/
	rect: null, /*Rect*/

	/**
	**	Bounds of the world.
	*/
	bounds: null, /*Rect*/

	/**
	**	Number of viewports in the world.
	*/
	numViewports: 0,

	/**
	**	Viewports of the world. Set by default to 0.2 of focus factor.
	*/
	viewports: null, /*Array*/

	/**
	**	Width and height of the world.
	*/
	worldWidth: 0,
	worldHeight: 0,

	/**
	**	Number of layers in the world.
	*/
	numLayers: 0,

	/**
	**	Array of layers.
	*/
	layers: null, /*Array*/

	/**
	**	Handler executed after each layer is drawn.
	*/
	onLayerDrawn: null, /*Array*/

	/**
	**	The update method of all objects will be executed when the World's update() method is called.
	*/
	updateQueue: null, /*List*/

	/**
	**	The draw method of all objects will be executed after the World's draw() method is called.
	*/
	drawQueue: null, /*List*/

	/**
	**	Indicates if a full screen clear should be performed before each frame.
	*/
	fullClear: true,

	/*
	**	Indicates if elements marked as FLAG_HOLLOW should be drawn or not.
	*/
	drawHollow: false,

	/**
	**	Constructs a world container with the specified dimensions, number of layers and number of viewports.
	*/
	__ctor: function (numViewports, numLayers, worldWidth, worldHeight, focusFactor/*0.2*/)
	{
		if (focusFactor === undefined) focusFactor = 0.2;

		this.numLayers = numLayers;
		this.numViewports = numViewports;

		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;

		var halfX = (worldWidth + 0) >> 1;
		var halfY = (worldHeight + 0) >> 1;

		var minX = -halfX;
		var maxX = halfX;

		var minY = -halfY;
		var maxY = halfY;

		this.layers = new Array();
		this.viewports = new Array();

		this.updateQueue = new List();
		this.drawQueue = new List();

		this.onLayerDrawn = [ ];

		for (var i = 0; i < numLayers; i++)
			this.layers[i] = new QuadTree (minX, minY, maxX, maxY, 16);

		for (var i = 0; i < numViewports; i++)
			this.viewports[i] = new Viewport (0, 0, System.screenWidth, System.screenHeight, worldWidth, worldHeight, focusFactor);

		this.bounds = Rect.alloc(worldWidth, worldHeight);
		this.rect = Rect.alloc();
	},

	/**
	**	Destroys the world and all in it.
	*/
	__dtor: function ()
	{
		for (var i = 0; i < this.numLayers; i++)
			dispose(this.layers[i]);

		for (var i = 0; i < this.numViewports; i++)
			dispose(this.viewports[i]);

		dispose(this.updateQueue);
		dispose(this.drawQueue);
	},

	/**
	**	Returns the width of the world.
	*/
	getWidth: function ()
	{
		return this.worldWidth;
	},

	/**
	**	Returns the height of the world.
	*/
	getHeight: function ()
	{
		return this.worldHeight;
	},

	/**
	**	Returns a viewport of the world.
	*/
	getViewport: function (index) /*Viewport*/
	{
		if (index < 0 || index >= this.numViewports)
			return null;

		return this.viewports[index];
	},

	/**
	**	Returns the bounds of the world.
	*/
	getBounds: function () /*Rect*/
	{
		return this.bounds;
	},

	/**
	**	Returns a layer given its index. Returns null if the index if out of range.
	*/
	getLayer: function (layer) /*QuadTree*/
	{
		if (layer < 0 || layer >= this.numLayers)
			return null;

		return this.layers[layer];
	},

	/**
	**	Adds the specified element to the periodic update queue.
	*/
	updateQueueAdd: function (/*DisplayElement*/elem)
	{
		this.updateQueue.push (elem);
	},

	/**
	**	Removes the specified element from the periodic update queue.
	*/
	updateQueueRemove: function (/*DisplayElement*/elem)
	{
		this.updateQueue.remove (this.updateQueue.sgetNode(elem));
	},

	/**
	**	Adds the specified object to the extra draw queue.
	*/
	drawQueueAdd: function (/*object*/elem)
	{
		this.drawQueue.push (elem);
	},

	/**
	**	Removes the specified element from the periodic update queue.
	*/
	drawQueueRemove: function (/*object*/elem)
	{
		this.drawQueue.remove (this.drawQueue.sgetNode(elem));
	},

	/**
	**	Adds the specified object to the extra draw and update queue.
	*/
	queueAdd: function (/*object*/elem)
	{
		this.drawQueue.push (elem);
		this.updateQueue.push (elem);
	},

	/**
	**	Removes the specified element from the draw and update queue.
	*/
	queueRemove: function (/*object*/elem)
	{
		this.drawQueue.remove (this.drawQueue.sgetNode(elem));
		this.updateQueue.remove (this.updateQueue.sgetNode(elem));
	},

	/**
	**	Draws all elements that lie inside the viewports.
	*/
	draw: function (g)
	{
		if (this.fullClear) g.clear(true);

		for (var viewportIndex = 0; viewportIndex < this.numViewports; viewportIndex++)
		{
			var viewport = this.viewports[viewportIndex];
			if (!viewport.isEnabled()) continue;

			g.save();

			let clipArea = viewport.getScreenBounds();
			g.beginPath();
			g.rect(clipArea.x1, clipArea.y1, clipArea.width(), clipArea.height());
			g.clip();

			g.pushMatrix();
			viewport.applyTransform(g);

			this.rect.set(viewport.getBounds());

			for (var layerIndex = 0; layerIndex < this.numLayers; layerIndex++)
			{
				var layer = this.layers[layerIndex];
				if (!layer.getVisible()) continue;

				var elem;

				layer.selectItems (this.rect);

				/*DEBUG*/layer.selectedCount = 0;

				while ((elem = layer.getNextSelectedItem()) != null)
				{
					if (elem.getFlags(DisplayElement.FLAG_FRAGMENT))
						continue;

					if (elem.getFlags(DisplayElement.FLAG_HOLLOW) && this.drawHollow !== true)
						continue;

					/*DEBUG*/layer.selectedCount++;
					elem.draw(g);
				}

				if (this.onLayerDrawn[layerIndex])
					this.onLayerDrawn[layerIndex] (g);
			}

			g.popMatrix();
			g.restore();
		}

		for (var elem = this.drawQueue.top; elem; elem = elem.next)
			elem.value.draw(g);
	},

	/**
	**	Performs an update cycle. Note that dt is passed to the sub-update methods in seconds NOT milliseconds.
	*/
	update: function (dt)
	{
		var dtm = dt;
		dt /= 1000;

		this.updateElems(dt, dtm);
		this.onUpdated(dt, dtm);
		this.updateLayers();
		this.updateViewports(dt, dtm);
	},

	/**
	**	Executed after all elements in the world have been updated. Parameter dt is in seconds, dtm in milliseconds.
	*/
	onUpdated: function (dt, dtm)
	{
	},

	/**
	**	Performs an update cycle on all elements that have requested a periodic update. Parameter dt is in seconds, dtm in milliseconds.
	*/
	updateElems: function (dt, dtm)
	{
		var elem_next;

		for (var elem = this.updateQueue.top; elem; elem = elem.next)
			elem._used = false;

		for (var elem = this.updateQueue.top; elem; elem = elem_next)
		{
			elem_next = elem.next;
			if (elem._used) continue;

			var eId = elem.objectId;
			elem._used = true;

			elem.value.update(dt, dtm);

			if (elem.objectId != eId)
			{
				elem = this.updateQueue.top;
				continue;
			}
		}
	},

	/**
	**	Executes an update cycle on all viewports. Parameter dt is in seconds, dtm in milliseconds.
	*/
	updateViewports: function (dt, dtm)
	{
		for (var viewportIndex = 0; viewportIndex < this.numViewports; viewportIndex++)
		{
			var viewport = this.viewports[viewportIndex];
			if (!viewport.isEnabled()) continue;

			viewport.update(dt, dtm);
		}
	},

	/**
	**	Executes an update cycle on all layers.
	*/
	updateLayers: function ()
	{
		for (var layer = 0; layer < this.numLayers; layer++)
			this.layers[layer].update();
	},

	/**
	**	Truncates the position of the element to the bounds of the world. Returns D0 set if truncated to the top,
	**	D1 set if truncated to bottom, D2 if truncated to left and D3 if truncated to right.
	*/
	truncatePosition: function (/*DisplayElement*/elem)
	{
		var elemBounds = elem.getBounds();
		var value = 0;

		if (elemBounds.x2 > this.bounds.x2)
			elem.translate (this.bounds.x2 - elemBounds.x2, 0), value |= (1 << 3);

		if (elemBounds.y2 > this.bounds.y2)
			elem.translate (0, this.bounds.y2 - elemBounds.y2), value |= (1 << 1);

		if (elemBounds.x1 < this.bounds.x1)
			elem.translate (this.bounds.x1 - elemBounds.x1, 0), value |= (1 << 2);

		if (elemBounds.y1 < this.bounds.y1)
			elem.translate (0, this.bounds.y1 - elemBounds.y1), value |= (1 << 0);

		return value;
	},

	moveToContact: function (a, b)
	{
		var ra = a.getLBounds();
		var rb = b.getLBounds();

		var p_ra = a.getLastBounds();
		var tmp = a.getBounds();
		p_ra = this.rect.set(ra).translate(p_ra.x1 - tmp.x1, p_ra.y1 - tmp.y1);

		var delta = new Vec2();
		delta.set(a.getVelocity());

		var t_bottom = ra.y2 == p_ra.y2 ? -1 : (rb.y1 - p_ra.y2) / (ra.y2 - p_ra.y2);
		var t_top = ra.y1 == p_ra.y1 ? -1 : (rb.y2 - p_ra.y1) / (ra.y1 - p_ra.y1);
		var t_left = ra.x1 == p_ra.x1 ? -1 : (rb.x2 - p_ra.x1) / (ra.x1 - p_ra.x1);
		var t_right = ra.x2 == p_ra.x2 ? -1 : (rb.x1 - p_ra.x2) / (ra.x2 - p_ra.x2);

		var dir = 0;

		if (t_top < 0 || t_top > 1) t_top = 1048576;
		if (t_bottom < 0 || t_bottom > 1) t_bottom = 1048576;
		if (t_left < 0 || t_left > 1) t_left = 1048576;
		if (t_right < 0 || t_right > 1) t_right = 1048576;

		if (t_top != 1048576 && t_top < t_bottom && t_top < t_left && t_top < t_right)
		{
			dir = "D_TOP";
		}
		else if (t_bottom != 1048576 && t_bottom < t_left && t_bottom < t_right)
		{
			dir = "D_BOTTOM";
		}
		else if (t_left != 1048576 && t_left < t_right)
		{
			dir = "D_LEFT";
		}
		else if (t_right != 1048576)
		{
			dir = "D_RIGHT";
		}

		switch (dir)
		{
			case "D_TOP":
				a.translate (0, rb.y2 - ra.y1);
				a.getVelocity().y = 0;
				break;

			case "D_BOTTOM":
				a.translate (0, rb.y1 - ra.y2);
				a.getVelocity().y = 0;
				break;

			case "D_LEFT":
				a.translate (rb.x2 - ra.x1, 0);
				a.getVelocity().x = 0;
				break;

			case "D_RIGHT":
				a.translate (rb.x1 - ra.x2, 0);
				a.getVelocity().x = 0;
				break;
		}
	}
});

/**
**	Truncation position bits.
*/
World.T_TOP		=	0x01;
World.T_BOTTOM	=	0x02;
World.T_LEFT	=	0x04;
World.T_RIGHT	=	0x08;
