/*
**	@rsthn/cherry/gx/visual-button
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

const VisualElement = require('./visual-element');
const ScreenControls = require('./screen-controls');
const Controls = require('../controls');
const G = require('../globals');

/**
**
*/

module.exports = VisualElement.extend
({
	className: "VisualButton",

	keyCode: 0,

	init: function (x, y, img_normal, img_pressed, is_center=true)
	{
		this.img = null;

		if (is_center === false)
			this.button = new Controls.Button (0, 0, 0, 0, img_normal, img_pressed);
		else
			this.button = new Controls.Button (0, 0, -img_normal.width*0.5, -img_normal.height*0.5, img_normal, img_pressed);

		this.button.onChange = (status, pstatus) => { this.onChange (status, pstatus); if (status == 0 && pstatus == 1) this.onTap(); };
	},

	resizeHitboxBy: function(dx, dy)
	{
		this.button.hbounds.resizeBy(dx, dy);
		return this;
	},

	update: function (dt)
	{
		if (arguments.length == 2)
		{
			return this.update_button (arguments[0], arguments[1]);
		}

		if (!this.getVisible() || !this.getEnabled())
			return;

		if (this.anim != null) this.anim.update (dt*1000);

		this.lupdate(dt);
	},

	update_button: function (x, y)
	{
		return this.button.update (x - this.getX(), y - this.getY());
	},

	onAdded: function()
	{
		ScreenControls.add(this);
	},

	onRemoved: function()
	{
		ScreenControls.remove(this);
	},

	activate: function (pointer)
	{
		this.button.activate (pointer);
		pointer._ref = this;
	},

	deactivate: function (pointer)
	{
		this.button.deactivate(pointer);
		pointer._ref = null;
	},

	containsPoint: function(x, y)
	{
		if (!this.getEnabled())
			return false;

		const p = this.reverseTransform ({ x: x, y: y });
		return this.button.containsPoint(p.x, p.y);
	},

	ldraw: function (g)
	{
		this.button.draw(g);

		if (G.debugHitbox)
		{
			g.fillStyle("rgba(255,0,0,0.25)");
			g.fillRect(this.button.hbounds.x1, this.button.hbounds.y1, this.button.hbounds.width(), this.button.hbounds.height());
		}
	},

	onChange: function (status, pstatus)
	{
		/* USER DEFINED */
	},

	onTap: function()
	{
		/* USER DEFINED */
	}
});
