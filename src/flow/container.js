/*
**	flow/container.js
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
import Element from './element.js';
import List from '../utils/list.js';

/*
**	Element container class.
*/

export default Class.extend(List, Element,
{
	className: 'Container',

	orderingEnabled: false,
	reverseDraw: false,

	__ctor: function (orderingEnabled=false)
	{
		this._super.List.__ctor();
		this._super.Element.__ctor();

		this.orderingEnabled = orderingEnabled;
		this.container = false;
	},

	_lessThan: function (a, b)
	{
		return a.hitbox.y2 < b.hitbox.y2;
	},

	_addElement: function (elem, atBottom)
	{
		elem.container = this;

		if (this.orderingEnabled && this.count != 0)
		{
			for (let i = this.top; i; i = i.next)
			{
				if (!this._lessThan(elem, i.value))
					continue;

				this.insertBefore(i, elem);

				elem.node = i.prev;
				return this;
			}
		}

		this._super.List[atBottom ? 'push' : 'unshift'] (elem);
		elem.node = atBottom ? this.bottom : this.top;

		return elem;
	},

	push: function(elem)
	{
		return this._addElement(elem, true);
	},

	unshift: function(elem)
	{
		return this._addElement(elem, false);
	},

	updatePosition: function(elem)
	{
		let node = elem.node;

		if (elem.container !== this || !this.orderingEnabled)
			return;

		if (node.prev && this._lessThan(elem, node.prev.value))
		{
			this.remove (elem.node);
			this.push (elem);
			return;
		}

		if (node.next && this._lessThan(node.next.value, elem))
		{
			this.remove (elem.node);
			this.push (elem);
			return;
		}
	},

	elementDraw: function(g)
	{
		this.curIndex = 0;

		if (this.reverseDraw)
			this.forEachRev((elem) => { elem.__i = this.curIndex++; elem.draw(g); });
		else
			this.forEach((elem) => { elem.__i = this.curIndex++; elem.draw(g); });
	},

	elementUpdate: function(dt)
	{
		this.forEach((v) => v.update(dt));
	}
});
