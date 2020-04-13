/*
**	@rsthn/cherry/gx/gamepad
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

const Layer = require('./layer');
const VisualElement = require('./visual-element');
const VisualButton = require('./visual-button');
const G = require('../globals');

/**
**
*/

module.exports = Layer.extend
({
	className: 'Gamepad',

	gamepad: null,
	gamepadHandler: [],

	spritesheet: null,

	width: 0, height: 0,
	spacing: 0, paddingH: 0, paddingV: 0,

	debugBounds: false,

	__ctor: function (spritesheet, spacing, x, y, width, height, paddingV, paddingH)
	{
		this.gamepad = new VisualElement (x, y);

		this.spritesheet = spritesheet;
		this.spacing = spacing;

		this.paddingV = paddingV || 0;
		this.paddingH = paddingH || 0;

		this.width = width;
		this.height = height;
	},

	__dtor: function()
	{
		dispose(this.gamepad);
	},

	resize: function (width, height)
	{
		this.width = width;
		this.height = height;

		for (let btn of this.gamepad.children)
			btn.setPosition((btn.__dx < 0 ? this.width : 0) + btn.__dx*this.spacing, (btn.__dy < 0 ? this.height : 0) + btn.__dy*this.spacing);
	},

	addButton: function (code, dx, dy, indexOff, indexOn, keyCode)
	{
		var btn = new VisualButton ((dx < 0 ? this.width : 0) + dx*this.spacing, (dy < 0 ? this.height : 0) + dy*this.spacing,
									this.spritesheet.getDrawable(indexOff), this.spritesheet.getDrawable(indexOn));

		btn.__dx = dx;
		btn.__dy = dy;

		btn.onChange = (state, pstate) => { this.onButton(code, state, pstate); };
		btn.resizeHitboxBy (this.paddingH, this.paddingV);

		if (keyCode)
			btn.keyCode = keyCode;

		this.gamepad.addChild(btn);
	},

	onButton: function (code, state, pstate)
	{
		if (!this.gamepadHandler.length)
			return;

		this.gamepadHandler[this.gamepadHandler.length-1].onButton (code, state, pstate);
	},

	draw: function(g)
	{
		if (G.debugBounds)
		{
			g.fillStyle("rgba(0,255,255,0.25)");
			g.fillRect(this.x, this.y, this.width, this.height);
		}

		this.gamepad.draw(g);
	}
});
