/*
**	@rsthn/cherry/gx/priority-queue
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

const PriorityQueue = require('./priority-queue');
const System = require('../system');
const Resources = require('../resources');
const C = require('../config');

/**
**
*/

const Boot = module.exports =
{
	modules: null,

	init: function ()
	{
		this.modules = new PriorityQueue();

		globalThis.main = function()
		{
			Resources.integerScaling = false;
		
			System.init ({ antialias: false, fullscreen: false, background: '#000', targetScreenWidth: C.WIDTH, targetScreenHeight: C.HEIGHT, fps: C.FPS, minFps: C.MIN_FPS || 15 });
		
			Boot.startup();
		};
	},

	register: function (module)
	{
		return this.modules.add(module);
	},

	unregister: function (module)
	{
		this.modules.remove(module);
		this.modules.cleanup();
	},

	startup: function ()
	{
		this.modules.forEachAsync( (m,r) => { if (m.onStartup(r) !== false) r(); } );
	},

	shutdown: function ()
	{
		this.modules.forEachAsyncRev( (m,r) => { if (m.onShutdown(r) !== false) r(); } );
	}
};

/**
**
*/

Boot.Module = Class.extend
({
	className: "Module",

	priority: 50,

	__ctor: function()
	{
		Boot.register(this);
	},

	onStartup: function (next)
	{
	},

	onShutdown: function (next)
	{
	}
});

// Initialize boot module.
Boot.init();
