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

const PriorityQueue = require('./priority-queue');
const Boot = require('./boot');
const System = require('../system');

/**
**
*/

module.exports = Boot.Module.create
({
	handlers: null,

	__ctor: function ()
	{
		this._super.Module.__ctor();

		this.handlers = new PriorityQueue();
	},

	register: function (handler)
	{
		try {
			this.handlers.add(handler);
		}
		catch (e) {
			throw new Error ("PointerHandler (register): " + e.message);
		}

		return handler;
	},

	unregister: function (handler)
	{
		try {
			this.handlers.remove(handler);
			this.handlers.cleanup();
		}
		catch (e) {
			throw new Error ("PointerHandler (unregister): " + e.message);
		}
	},

	onStartup: function()
	{
		System.onPointerEvent = (action, p, pointers) =>
		{
			this.handlers.forEach((h) => h.onPointerEvent(action, p, pointers));
		};
	},

	onShutdown: function()
	{
		System.onPointerEvent = null;
	}
});
