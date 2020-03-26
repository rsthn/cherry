/*
**	@rsthn/cherry/gx/pointer-handler
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

const PointerHandler = require('./pointer-handler');
const KeyboardHandler = require('./keyboard-handler');
const System = require('../system');

/**
**
*/

const ScreenControls = module.exports =
({
	priority: 50,

	list: [ ],

	add: function (c)
	{
		if (this.list.indexOf(c) === -1)
			this.list.push(c);
	},

	remove: function (c)
	{
		var i = this.list.indexOf(c);
		if (i !== -1) this.list.splice(i, 1);
	},

	findTarget: function (x, y, filter)
	{
		for (let i in this.list)
		{
			if (!this.list[i]) continue;

			if (this.list[i] instanceof Array)
			{
				for (let j = 0; j < this.list[i].length; j++)
				{
					if (filter != null && filter(this.list[i][j]) == false)
						continue;

					if (this.list[i][j].containsPoint(x, y))
						return this.list[i][j];
				}
			}
			else
			{
				if (filter != null && filter(this.list[i]) == false)
					continue;

				if (this.list[i].containsPoint(x, y))
					return this.list[i];
			}
		}

		return null;
	},

	onPointerEvent: function (action, p, pointers)
	{
		let _continue = true;
		let tmp = null;

		switch (action)
		{
			case System.EVT_POINTER_DOWN:
				let tmp = this.findTarget(p.x, p.y);
				if (tmp != null)
				{
					(p._ref = tmp).activate(p);
					_continue = false;
				}

				break;

			case System.EVT_POINTER_DRAG_START:
				if (p._ref != null) _continue = false;
				break;

			case System.EVT_POINTER_DRAG_MOVE:
				if (p._ref != null)
				{
					if (p._ref.containsPoint(p.x, p.y) || p._ref.focusLock == true)
					{
						p._ref.update (p.x, p.y, p);
						_continue = false;
					}
					else
					{
						p._ref.deactivate(p);
						p._ref = null;

						tmp = this.findTarget(p.x, p.y);
						if (tmp != null)
						{
							(p._ref = tmp).activate(p);
							_continue = false;
						}
					}
				}
				else
				{
					let tmp = this.findTarget(p.x, p.y);
					if (tmp != null)
					{
						(p._ref = tmp).activate(p);
						_continue = false;
					}
				}

				break;

			case System.EVT_POINTER_DRAG_STOP:
				if (p._ref != null) _continue = false;
				break;

			case System.EVT_POINTER_UP:
				if (p._ref != null)
				{
					p._ref.deactivate(p);
					p._ref = null;

					_continue = false;
				}

				break;
		}

		return _continue;
	},

	onKeyboardEvent: function (action, keyCode, keyArgs)
	{
		switch (action)
		{
			case System.EVT_KEY_DOWN:

				for (var i in this.list)
				{
					if (!this.list[i]) continue;

					if (this.list[i] instanceof Array)
					{
						for (var j = 0; j < this.list[i].length; j++)
						{
							if (this.list[i][j].keyCode == keyCode)
							{
								this.list[i][j].activate({ });
								j = -1;
								break;
							}
						}

						if (j == -1) break;
					}
					else
					{
						if (this.list[i].keyCode == keyCode)
						{
							this.list[i].activate({ });
							break;
						}
					}
				}

				break;

			case System.EVT_KEY_UP:

				for (var i in this.list)
				{
					if (!this.list[i]) continue;

					if (this.list[i] instanceof Array)
					{
						for (var j = 0; j < this.list[i].length; j++)
						{
							if (this.list[i][j].keyCode == keyCode)
							{
								this.list[i][j].deactivate({ });
								j = -1;
								break;
							}
						}

						if (j == -1) break;
					}
					else
					{
						if (this.list[i].keyCode == keyCode)
						{
							this.list[i].deactivate({ });
							break;
						}
					}
				}
	
				break;
		}
	}
});

PointerHandler.register(ScreenControls);
KeyboardHandler.register(ScreenControls);
