/*
**	@rsthn/cherry/gx/visual-element
**
**	Copyright (c) 2013-2020, RedStar Technologies, All rights reserved.
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
const Rect = require('../rect');
const G = require('../globals');
const C = require('../config');

/**
**
*/

module.exports = Class.extend
({
	className: "VisualElement",

	scale: 1, x: 0, y: 0, width: 0, height: 0, img: null,

	t: 0,
	type: 0,

	inherited_enabled: true,
	enabled: true,

	inherited_visible: true,
	visible: true,

	debugHitbox: false, highlight: false,
	anim: null,

	container: null, node: null, /* Set by DisplayList */

	parent: null, /* Set by addRelated() or addChild() */
	children: null, /* Array of directly related Tiles (same container). Drawn after the parent, position is relative to parent. */
	related: null, /* Array of other directly related Tiles (possibly on other containers), position is absolute. */

	hitbox: null,
	sensebox: null,

	undisposable: false,

	__ctor: function (x, y, drawable)
	{
		this.x = x;
		this.y = y;
		this.img = drawable || null;

		if (this.img)
		{
			this.width = this.img.width;
			this.height = this.img.height;
		}
		else
		{
			this.width = C.TILE_SIZE;
			this.height = C.TILE_SIZE;
		}

		this.hitbox = Rect.alloc();
		this.hitbox.resize (this.width, this.height);
		this.hitbox.translate (this.x - this.hitbox.x1, this.y - this.hitbox.y1);
		this.hitbox.translate (-this.width*0.5, -this.height*0.5);

		this.children = [];
		this.init.apply(this, arguments);
	},

	__dtor: function()
	{
		if (this.undisposable) return;

		dispose (this.hitbox);

		if (this.sensebox)
		{
			this.sensebox = null;
			dispose (this.sensebox);
		}

		this.remove();

		if (this.related != null)
		{
			var tmp = this.related;
			this.related = null;

			for (var i = 0; i < tmp.length; i++)
				dispose(tmp[i]);
		}

		var tmp = this.children;

		for (var i = 0; i < tmp.length; i++)
			dispose(tmp[i]);
	},

	init: function()
	{
	},

	resizeHitbox: function (dx, dy, normalized)
	{
		if (normalized === true)
		{
			dx *= this.width;
			dy *= this.height;
		}

		this.hitbox.zero();
		this.hitbox.translate (this.x, this.y);
		this.hitbox.translate (0.5*this.width, 0.5*this.height);
		this.hitbox.resize (dx, dy);
	},

	getX: function()
	{
		return this.x + (this.parent != null ? this.parent.getX() : 0);
	},

	getY: function()
	{
		return this.y + (this.parent != null ? this.parent.getY() : 0);
	},

	reverseTransform: function (pos)
	{
		if (this.parent != null)
			this.parent.reverseTransform (pos);

		pos.x -= this.x;
		pos.y -= this.y;

		pos.x /= this.scale;
		pos.y /= this.scale;

		return pos;
	},

	setScale: function (value)
	{
		this.scale = value;
		return this;
	},

	getEnabled: function()
	{
		return this.enabled && this.inherited_enabled;
	},

	setEnabled: function (value, inherited)
	{
		if (inherited === true)
			this.inherited_enabled = value;
		else
			this.enabled = value;

		value = this.getEnabled();

		for (var i = 0; i < this.children.length; i++)
			this.children[i].setEnabled (value, true);

		return this;
	},

	getVisible: function()
	{
		return this.visible && this.inherited_visible;
	},

	setVisible: function (value, inherited)
	{
		if (inherited === true)
			this.inherited_visible = value;
		else
			this.visible = value;

		value = this.getVisible();

		for (var i = 0; i < this.children.length; i++)
			this.children[i].setVisible (value, true);

		return this;
	},

	setAnim: function (anim)
	{
		this.anim = anim;
		this.anim.target = this;

		return this;
	},

	resetAnim: function (anim)
	{
		if (anim) this.setAnim (anim);

		if (this.anim != null)
			this.anim.reset();

		for (var i = 0; i < this.children.length; i++)
			this.children[i].resetAnim();
	},

	addTo: function (list/*: DisplayList*/)
	{
		list.push(this);
		return this;
	},

	addRelated: function (elem)
	{
		if (this.related == null)
			this.related = [];

		elem.parent = this;
		this.related.push (elem);

		return elem;
	},

	addChild: function (elem)
	{
		if (elem == null)
			return elem;

		elem.parent = this;
		this.children.push (elem);

		elem.setEnabled (this.getEnabled(), true);
		elem.onAdded();

		return elem;
	},

	removeRelated: function (elem)
	{
		if (elem == null || elem.parent !== this || this.related == null)
			return elem;

		var i = this.related.indexOf(elem);
		if (i === -1) return elem;

		this.related.splice(i, 1);

		return elem;
	},

	removeChild: function (elem)
	{
		if (elem == null || elem.parent !== this)
			return elem;

		var i = this.children.indexOf(elem);
		if (i === -1) return elem;

		this.children.splice(i, 1);
		elem.onRemoved();

		return elem;
	},

	remove: function()
	{
		if (this.container != null)
		{
			this.container.remove (this.node);
			this.container = null;
		}

		if (this.parent != null)
		{
			this.parent.removeRelated(this);
			this.parent.removeChild(this);
			this.parent = null;
		}

		return this;
	},

	updatePosition: function()
	{
		if (this.container != null)
			this.container.updatePosition(this);

		if (this.related != null)
		{
			for (var i = 0; i < this.related.length; i++)
			{
				if (this.related[i].container != null)
					this.related[i].container.updatePosition (this.related[i]);
			}
		}
	},

	containsPoint: function(x, y)
	{
		return this.x <= x && x < this.x+this.width && this.y <= y && y < this.y+this.height;
	},

	setPosition: function (x, y)
	{
		if (arguments.length == 1)
			return this.setPosition(x.x, x.y);

		this.translate(x - this.x, y - this.y);
		return this;
	},

	translate: function (dx, dy)
	{
		if (this.related != null)
		{
			for (var i = 0; i < this.related.length; i++)
				this.related[i].translate(dx, dy);
		}

		this.x += dx;
		this.y += dy;

		this.hitbox.translate (dx, dy);
		if (this.sensebox) this.sensebox.translate (dx, dy);
	},

	draw: function (g)
	{
		if (!this.getVisible()) return;

		g.pushMatrix();
		g.pushAlpha();

		g.scale (this.scale, this.scale);
		g.translate(this.x, this.y);

		if (this.anim != null)
		{
			g.translate (this.anim.data.dx, this.anim.data.dy);
			g.scale (this.anim.data.sx, this.anim.data.sy);
			g.alpha (this.anim.data.alpha);
		}

		this.applyTransforms(g);

		if (this.img != null)
		{
			g.pushMatrix();
			g.translate(-(this.img.width >> 1), -(this.img.height >> 1));
			this.img.draw(g, 0, 0);

			if (G.debugBounds)
			{
				g.strokeStyle("yellow");
				g.strokeRect(0, 0, this.width, this.height);
			}

			g.popMatrix();
		}
		else
			this.ldraw(g);

		for (var i = 0; i < this.children.length; i++)
			this.children[i].draw(g);

		this.onDrawn(g);

		g.popMatrix();
		g.popAlpha();

		if (G.debugImage)
		{
			g.fillStyle("rgba(255,255,255,0.1)");
			g.fillRect(this.x, this.y, this.width, this.height);
		}

		if (G.debugHitbox || this.debugHitbox)
		{
			if (this.sensebox)
			{
				g.fillStyle("rgba(255,255,0,0.2)");
				g.fillRect(int(this.sensebox.x1), int(this.sensebox.y1), int(this.sensebox.width()), int(this.sensebox.height()));
			}

			if (!this.type)
				g.fillStyle("rgba(255,255,255,0.1)");
			else
				g.fillStyle("rgba(0,255,255,0.4)");

			if (this.highlight)
			{
				g.fillStyle("rgba(255,0,0,0.5)");
				this.highlight = false;
			}

			g.fillRect(int(this.hitbox.x1), int(this.hitbox.y1), int(this.hitbox.width()), int(this.hitbox.height()));
		}
	},

	update: function (dt)
	{
		if (!this.getVisible() || !this.getEnabled())
			return;

		if (this.anim != null) this.anim.update (dt*1000);

		for (var i = 0; i < this.children.length; i++)
			this.children[i].update(dt);

		this.lupdate(dt);
		this.onUpdated(dt);
	},

	onAdded: function()
	{
		/* USER DEFINED */
	},

	onRemoved: function()
	{
		/* USER DEFINED */
	},

	applyTransforms: function(g)
	{
		/* USER DEFINED */
	},

	ldraw: function(g)
	{
		/* USER DEFINED ; Only called if img is null. */
	},

	lupdate: function(dt)
	{
		/* USER DEFINED */
	},

	onDrawn: function (g)
	{
	},

	onUpdated: function (dt)
	{
	}
});
