/*
**	@rsthn/cherry/controls/button
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
const Controls = require('../controls');
const Rect = require('../rect');

/**
**	Button class provides an easy way to add push-button support to the world.
*/

module.exports = Class.extend
({
	/**
	**	Bounding box of the button control and hit box bounds.
	*/
	bounds: null, hbounds: null,

	/**
	**	Indicates if once focus is obtained it is locked until the user releases it.
	*/
	focusLock: false,

	/**
	**	Indicates if the button is visible (and thus enabled).
	*/
	visible: true,

	/**
	**	Both refX and refY indicate the screen area where the button should be placed (reference). Possible values can
	**	be Controls.LEFT, Controls.RIGHT, Controls.TOP and Controls.BOTTOM.
	*/
	refX: 0, refY: 0,

	/**
	**	The offset indicates the number of pixels to separate the button from the reference area (margin).
	*/
	offsX: 0, offsY: 0,

	/**
	**	Status of the button (0 for unpressed, 1 for pressed).
	*/
	status: 0, pstatus: 0,

	/**
	**	Images for the unpressed and pressed statuses.
	*/
	unpressedImg: null,
	pressedImg: null,

	/**
	**	Creates the button with the specified parameters.
	*/
	__ctor: function (refX, refY, offsX, offsY, unpressedImg, pressedImg)
	{
		this.unpressedImg = unpressedImg;
		this.pressedImg = pressedImg;

		var x = Controls.getXByRef(this.refX = refX);
		var y = Controls.getYByRef(this.refY = refY);

		offsX = (refX & 1 ? -1 : 1) * (this.offsX = offsX);
		offsY = (refY & 1 ? -1 : 1) * (this.offsY = offsY);

		x += Controls.getFByRef(this.refX) * unpressedImg.width + offsX;
		y += Controls.getFByRef(this.refY) * unpressedImg.height + offsY;

		this.bounds = Rect.alloc (this.unpressedImg.width, this.unpressedImg.height);
		this.bounds.translate (x - this.bounds.x1, y - this.bounds.y1);

		this.hbounds = Rect.alloc();
		this.hbounds.set (this.bounds);
	},

	/**
	**	Returns true if the button contains the specified point.
	*/
	containsPoint: function (x, y)
	{
		return this.visible == true ? this.hbounds.containsPoint(x, y) : false;
	},

	/**
	**	Draws the stick on the given graphics surface.
	*/
	draw: function (g)
	{
		if (!this.visible) return;

		this.preDraw(g);

		if (this.status)
		{
			if (!this.pressedImg)
			{
				g.pushMatrix();
				g.translate(this.bounds.cx, this.bounds.cy);
				g.scale(0.8, 0.8);
				this.unpressedImg.draw (g, -this.unpressedImg.width*0.5, -this.unpressedImg.height*0.5);
				g.popMatrix();
			}
			else
				this.pressedImg.draw (g, this.bounds.x1, this.bounds.y1);
		}
		else
			this.unpressedImg.draw (g, this.bounds.x1, this.bounds.y1);

		this.postDraw(g);
	},

	/**
	**	Executed before drawing the element.
	*/
	preDraw: function (g)
	{
	},

	/**
	**	Executed after drawing the element.
	*/
	postDraw: function (g)
	{
	},

	/**
	**	Should be called if the EVT_POINTER_DOWN event starts within the bounding box of the button.
	*/
	activate: function (pointer)
	{
		pointer._ref = this;

		this.pstatus = this.status;
		this.status = 1;

		this.onChange (this.status, this.pstatus);
	},

	/**
	**	Should be called if the EVT_POINTER_UP event is fired with the "_ref" attribute pointing to this object.
	*/
	deactivate: function (pointer)
	{
		pointer._ref = null;

		this.pstatus = this.status;
		this.status = 0;

		this.onChange (this.status, this.pstatus);
	},

	/**
	**	Button pointer update event. Not required for the button control.
	*/
	update: function (pointerX, pointerY)
	{
	},

	/**
	**	Resets the button to its initial state.
	*/
	reset: function ()
	{
		this.status = this.pstatus = 0;
		this.onChange (this.status, this.pstatus);
	},

	/**
	**	Executed after any change in the status of the button.
	*/
	onChange: function (status, pstatus)
	{
		if (status == 0 && pstatus == 1) this.onTap();
	},

	/**
	**	Executed when the button is tapped (pressed and then released). Works only if the onChange method was not overriden.
	*/
	onTap: function ()
	{
	}
});
