/*
**	@rsthn/cherry/gx/layer
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

const { Class } = require('@rsthn/rin');

/*
**
*/

module.exports = Class.extend
({
	className: 'Layer',

	visible: true,
	active: true,

	time: 0,

	__ctor: function()
	{
		this.time = 0;
		this.init.apply(this, arguments);
	},

	__dtor: function()
	{
	},

	init: function()
	{
		/* USER-DEFINED */
	},

	draw: function(g)
	{
		if (!this.visible) return;

		this._draw(g);
	},

	update: function(dt, dtm)
	{
		if (!this.active) return;

		this.time += dt;
		this._update(dt, dtm);
	},

	activate: function ()
	{
		/* USER-DEFINED */
	},

	deactivate: function ()
	{
		/* USER-DEFINED */
	},

	_draw: function(g) {
		/* USER-DEFINED */
	},

	_update: function(dt, dtm) {
		/* USER-DEFINED */
	}
});
