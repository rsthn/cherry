/*
**	cherryjs/core/linkable
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
const Recycler = require('./recycler');

/**
**	Generic class for linkable items such as required by linked lists. The responsibility of this class is
**	to wrap a value into a linkable object.
*/

const Linkable = module.exports = Class.extend
({
	className: "Linkable",

	/**
	**	Pointer to the previous item in the chain.
	*/
	prev: null, /* Linkable */

	/**
	**	Pointer to the next item in the chain.
	*/
	next: null, /* Linkable */

	/**
	**	Wrapped value.
	*/
	value: null,

	/**
	**	Constructs the linkable wrapper.
	*/
	__ctor: function (value)
	{
		this.value = value;
		this.clear();
	},

	/**
	**	Initializes the linkable item. Makes sure the previous and next pointers are clear.
	*/
	__reinit: function (value)
	{
		this.value = value;
		this.clear();

		return this;
	},

	/**
	**	Destructor.
	*/
	__dtor: function ()
	{
	},

	/**
	**	Sets the previous/next connection pointers to null.
	*/
	clear: function () /*Linkable*/
	{
		this.next = this.prev = null;
		return this;
	},

	/**
	**	Links the item to come after the given one.
	*/
	linkAfter: function (/*Linkable*/item)
	{
		this.prev = item;
		this.next = item ? item.next : null;

		if (item)
		{
			if (item.next) item.next.prev = this;
			item.next = this;
		}
	},

	/**
	**	Links the item to come before the given one.
	*/
	linkBefore: function (/*Linkable*/item)
	{
		this.prev = item ? item.prev : null;
		this.next = item;

		if (item)
		{
			if (item.prev) item.prev.next = this;
			item.prev = this;
		}
	},

	/**
	**	Unlinks the item from its neighbors.
	*/
	unlink: function () /*Linkable*/
	{
		if (this.prev) this.prev.next = this.next;
		if (this.next) this.next.prev = this.prev;

		return this.clear ();
	}
});

Recycler.attachTo (Linkable);
