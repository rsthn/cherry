/*
**	cherryjs/controls/stick
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
const Controls = require('./../controls');
const Rect = require('./../rect');

/**
**	Stick class provides an easy way to add directional control sticks to the world.
*/

module.exports = Class.extend
({
	/**
	**	Bounding box of the stick control.
	*/
	bounds: null,

	/**
	**	Indicates if once focus is obtained it is locked until the user releases it.
	*/
	focusLock: true,

	/**
	**	Indicates if the stick is visible (and thus enabled).
	*/
	visible: true,

	/**
	**	Both refX and refY indicate the screen area where the stick should be placed (reference). Possible values can
	**	be Controls.LEFT, Controls.RIGHT, Controls.TOP and Controls.BOTTOM.
	*/
	refX: 0, refY: 0,

	/**
	**	The offset indicates the number of pixels to separate the stick from the reference area (margin).
	*/
	offsX: 0, offsY: 0,

	/**
	**	Indicates the displacement in X and Y of the inner stick. This is calculated when the stick update() method is called.
	*/
	dispX: 0, dispY: 0,

	/**
	**	Current angle and radius of the stick.
	*/
	angle: 0, radius: 0,

	/**
	**	Number of steps for the angle and radius of the stick. Used to snap the stick to discrete steps.
	*/
	angleSteps: 0, radiusSteps: 0,

	/**
	**	Direction (X and Y) and magnitude of the stick vector. The dirX and dirY are normalized.
	*/
	rdirX: 0, rdirY: 0, dirX: 0, dirY: 0, magnitude: 0,

	/**
	**	Outer and inner images of the stick.
	*/
	outerImg: null,
	innerImg: null,

	/**
	**	Maximum radius that the inner stick can move.
	*/
	maxRadius: 0,

	/**
	**	Creates the stick with the specified parameters. The refX and refY are values from Controls.* enums.
	*/
	__ctor: function (refX, refY, offsX, offsY, outerImg, innerImg, maxRadiusRatio)
	{
		this.maxRadius = maxRadiusRatio*outerImg.width*0.5;

		this.outerImg = outerImg;
		this.innerImg = innerImg;

		var x = Controls.getXByRef(this.refX = refX);
		var y = Controls.getYByRef(this.refY = refY);

		offsX = (refX & 1 ? -1 : 1) * (this.offsX = offsX);
		offsY = (refY & 1 ? -1 : 1) * (this.offsY = offsY);

		x += Controls.getFByRef(this.refX) * outerImg.width + offsX;
		y += Controls.getFByRef(this.refY) * outerImg.height + offsY;

		this.bounds = Rect.alloc (this.outerImg.width, this.outerImg.height);
		this.bounds.translate (x - this.bounds.x1, y - this.bounds.y1);
	},

	/**
	**	Returns true if the stick contains the specified point.
	*/
	containsPoint: function (x, y)
	{
		return this.visible == true ? this.bounds.containsPoint(x, y) : false;
	},

	/**
	**	Draws the stick on the given graphics surface.
	*/
	draw: function (g)
	{
		if (!this.visible) return;

		var x = this.bounds.x1;
		var y = this.bounds.y1;

		this.outerImg.draw(g, x, y);
		this.innerImg.draw(g, this.bounds.cx - this.innerImg.width*0.5 + this.dispX, this.bounds.cy - this.innerImg.height*0.5 + this.dispY);
	},

	/**
	**	Should be called if the EVT_POINTER_DOWN event starts within the bounding box of the stick.
	*/
	activate: function (pointer)
	{
		pointer._ref = this;
	},

	/**
	**	Should be called if the EVT_POINTER_UP event is fired with the "_ref" attribute pointing to this object.
	*/
	deactivate: function (pointer)
	{
		pointer._ref = null;
		this.reset();
	},

	/**
	**	Updates the stick direction using the specified pointer coordinates. This should be called only if the EVT_POINTER_DOWN event started within
	**	the bounding box of the stick.
	*/
	update: function (pointerX, pointerY)
	{
		var dx = pointerX - this.bounds.cx;
		var dy = pointerY - this.bounds.cy;

		this.angle = Math.atan2(-dy, dx);
		this.radius = Math.sqrt(dx*dx + dy*dy);

		if (this.radius > this.maxRadius)
			this.radius = this.maxRadius;

		if (this.angleSteps)
		{
			var fs = (2*Math.PI / this.angleSteps);
			this.angle = int((this.angle + Math.PI + fs/2) / fs) * fs - Math.PI;
		}

		if (this.radiusSteps)
		{
			var fs = (this.maxRadius / this.radiusSteps);
			this.radius = int((this.radius + fs/2) / fs) * fs;
		}

		this.rdirX = Math.min(1, Math.max(dx / this.maxRadius, -1));
		this.rdirY = Math.min(1, Math.max(dy / this.maxRadius, -1));

		this.dispX = this.radius * Math.cos(this.angle);
		this.dispY = this.radius * -Math.sin(this.angle);

		if (this.radius > 0)
		{
			this.dirX = this.dispX / this.radius;
			this.dirY = this.dispY / this.radius;

			this.magnitude = this.radius / this.maxRadius;
		}
		else
		{
			this.dirX = 0;
			this.dirY = 0;

			this.magnitude = 0;
		}

		this.onChange(this.dirX, this.dirY, this.magnitude, this.angle);
	},

	/**
	**	Resets the stick to its initial position.
	*/
	reset: function ()
	{
		this.dispX = 0;
		this.dispY = 0;

		this.rdirX = 0;
		this.rdirY = 0;

		this.dirX = 0;
		this.dirY = 0;
		this.magnitude = 0;

		this.onChange(this.dirX, this.dirY, this.magnitude, this.angle);
	},

	/**
	**	Executed after any change in the direction of the stick.
	*/
	onChange: function (dirX, dirY, magnitude, angle)
	{
	}
});
