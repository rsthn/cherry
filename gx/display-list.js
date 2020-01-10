/*
**	@rsthn/cherry/gx/display-list
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

const List = require('../list');

/**
**
*/

module.exports = List.extend
({
	className: 'DisplayList',

	orderingEnabled: false,

	area: null,

	__ctor: function(orderingEnabled)
	{
		this._super.List.__ctor.apply(this, arguments);

		this.orderingEnabled = orderingEnabled || false;
	},

	push: function(item)
	{
		if (this.orderingEnabled && this.count != 0)
		{
			for (var i = this.top; i; i = i.next)
			{
				if (item.hitbox.y2 < i.value.hitbox.y2)
				{
					this.insertBefore(i, item);

					item.container = this;
					item.node = i.prev;
					return this;
				}
			}
		}

		this._super.List.push(item);

		item.container = this;
		item.node = this.bottom;

		return this;
	},

	updatePosition: function(item)
	{
		var node = item.node;

		if (this.orderingEnabled)
		{
			if (node.prev && node.prev.value.hitbox.y2 > item.hitbox.y2)
			{
				this.remove (item.node);
				this.push (item);
				return;
			}

			if (node.next && item.hitbox.y2 > node.next.value.hitbox.y2)
			{
				this.remove (item.node);
				this.push (item);
				return;
			}
	}
	},

	forEach: function(fn)
	{
		var ni;
	
		for (var i = this.top; i; i = ni)
		{
			ni = i.next;
			if (fn (i.value, i, this) === false) return false;
		}

		return true;
	},

	forEachRev: function(fn)
	{
		var ni;
	
		for (var i = this.bottom; i; i = ni)
		{
			ni = i.prev;
			if (fn (i.value, i, this) === false) return false;
		}

		return true;
	},

	draw: function(g, reverse)
	{
		this.curIndex = 0;
		var _ = this;

		g.pushMatrix();

		if (this.area != null)
		{
			g.translate (this.area.x1, this.area.y1);
		}

		if (reverse === true)
			this.forEachRev(function(v, i, l) { v.__i = _.curIndex++; v.draw(g); });
		else
			this.forEach(function(v, i, l) { v.__i = _.curIndex++; v.draw(g); });

		g.popMatrix();
	},

	update: function(dt)
	{
		this.forEach(function(v, i, l) { v.update(dt); });
	},

	find: function (filter)
	{
		var item = null;
		this.forEach(function(v, i, l) { if (filter(v)) { item = v; return false; } });
		return item;
	},

	filter: function(filter, callback)
	{
		var ni;
	
		for (var i = this.top; i; i = ni)
		{
			ni = i.next;
			if (filter (i.value) !== false)
			{
				var res = callback (i.value);
				if (res !== null) return res;
			}
		}

		return null;
	}
});
