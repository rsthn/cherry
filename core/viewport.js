/*
**	cherryjs/core/viewport
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

/**
**	Viewport class controls the current visible rectangle of the world.
*/

const Rect = require('./rect');

/**
**	Constructs the viewport with the specified viewport and world dimensions. A focus factor can
**	be specified as well, if none provided the default value is 0.4.
*/

const Viewport = module.exports = function (sx, sy, width, height, worldWidth, worldHeight, focusFactorX/*0.4*/, focusFactorY/*0.4*/)
{
	this.focusFactorX = focusFactorX == undefined ? 0.4 : focusFactorX;
	this.focusFactorY = focusFactorY == undefined ? 0.4 : focusFactorY;

	this.focusTarget = null;

	this.sx = sx;
	this.sy = sy;

	if (width > worldWidth) width = worldWidth;
	if (height > worldHeight) height = worldHeight;

	this.width = width >> 1;
	this.height = height >> 1;

	worldWidth >>= 1;
	worldHeight >>= 1;

	this.worldX1 = -worldWidth;
	this.worldY1 = -worldHeight;
	this.worldX2 = +worldWidth;
	this.worldY2 = +worldHeight;

	this.bounds = Rect.alloc();
	this.screenBounds = Rect.alloc();

	this.x = 0;
	this.y = 0;

	this.enabled = true;

	this.updateScreenBounds();
	this.updateBounds();
};

/**
**	Dimensions of the viewport.
*/
Viewport.prototype.width = 0;
Viewport.prototype.height = 0;

/**
**	Position of the viewport in screen space.
*/
Viewport.prototype.sx = 0;
Viewport.prototype.sy = 0;

/**
**	Position of the viewport in the world.
*/
Viewport.prototype.x = 0;
Viewport.prototype.y = 0;

/**
**	Ratio for the viewport's center (value from -1 to 1), used when focusing to use a different focus point instead of the exact center.
*/
Viewport.prototype.centerRatioX = 0;
Viewport.prototype.centerRatioY = 0;

/**
**	Position delta, used to move the viewport around without affecting the focus point.
*/
Viewport.prototype.dx = 0;
Viewport.prototype.dy = 0;

/**
**	Boundaries of the world (automatically calculated from the world dimensions).
*/
Viewport.prototype.worldX1 = 0;
Viewport.prototype.worldY1 = 0;
Viewport.prototype.worldX2 = 0;
Viewport.prototype.worldY2 = 0;

/**
**	The focus factor determines the ratio of a smaller viewport on which the current focus point must 
**	be contained. If the focus point is not inside the smaller viewport scrolling will be performed.
*/
Viewport.prototype.focusFactorX = 0;
Viewport.prototype.focusFactorY = 0;

/**
**	Focus target of the viewport. When the viewport is updated it will automatically focus on this element.
*/
Viewport.prototype.focusTarget = null;

/**
**	Indicates if the viewport is enabled.
*/
Viewport.prototype.enabled = false;

/**
**	Viewport scale.
*/
Viewport.prototype.scale = 1;

/**
**	Returns the enabled flag of the viewport.
*/
Viewport.prototype.isEnabled = function ()
{
	return this.enabled;
};

/**
**	Sets the enabled flag of the viewport.
*/
Viewport.prototype.setEnabled = function (enabled)
{
	this.enabled = enabled;
	return this;
};

/**
**	Updates the bound rect of the viewport.
*/
Viewport.prototype.updateBounds = function ()
{
	this.bounds.set (this.x-(this.width/this.scale)+this.dx, this.y-(this.height/this.scale)+this.dy, this.x+(this.width/this.scale)+this.dx, this.y+(this.height/this.scale)+this.dy);
};

/**
**	Updates the screen bound rect of the viewport.
*/
Viewport.prototype.updateScreenBounds = function ()
{
	this.screenBounds.set (this.sx, this.sy, this.sx + (this.width << 1), this.sy + (this.height << 1));
};

/**
**	Sets the dimensions of the viewport.
*/
Viewport.prototype.setSize = function (width, height)
{
	this.width = width >> 1;
	this.height = height >> 1;

	this.updateScreenBounds();
	this.updateBounds();

	return this;
};

/**
**	Sets the position of the viewport.
*/
Viewport.prototype.setPosition = function (x, y)
{
	this.dx = x;
	this.dy = y;

	this.updateBounds();
	return this;
};

/**
**	Sets the scale of the viewport.
*/
Viewport.prototype.setScale = function (value)
{
	this.scale = value;

	this.updateScreenBounds();
	this.updateBounds();

	return this;
};

/**
**	Sets the center ratio of the viewport.
*/
Viewport.prototype.setCenter = function (rx, ry)
{
	this.centerRatioX = rx;
	this.centerRatioY = ry;

	return this;
};

/**
**	Moves the viewport.
*/
Viewport.prototype.translate = function (dx, dy)
{
	this.dx += dx;
	this.dy += dy;

	this.updateBounds();
	return this;
};

/**
**	Sets the screen position of the viewport.
*/
Viewport.prototype.setScreenPosition = function (sx, sy)
{
	this.sx = sx;
	this.sy = sy;

	this.updateScreenBounds();
};

/**
**	Returns the X position of the viewport inside the world.
*/
Viewport.prototype.getX = function ()
{
	return this.x + this.dx;
};

/**
**	Returns the Y position of the viewport inside the world.
*/
Viewport.prototype.getY = function ()
{
	return this.y + this.dy;
};

/**
**	Returns the width of the viewport.
*/
Viewport.prototype.getWidth = function ()
{
	return this.width << 1;
};

/**
**	Returns the height of the viewport.
*/
Viewport.prototype.getHeight = function ()
{
	return this.height << 1;
};

/**
**	Returns the bounds of the viewport in world-space.
*/
Viewport.prototype.getBounds = function ()
{
	return this.bounds;
};

/**
**	Returns the bounds of the viewport in screens-space.
*/
Viewport.prototype.getScreenBounds = function ()
{
	return this.screenBounds;
};

/**
**	Moves the viewport to focus on the specified point. I no focus factor is specified the default will be used.
*/
Viewport.prototype.focusOn = function (i, j, kx/*0*/, ky/*0*/)
{
	if (!kx) kx = this.focusFactorX;
	if (!ky) ky = this.focusFactorY;

	var x1 = this.x - kx*this.width + this.centerRatioX*this.width;
	var x2 = this.x + kx*this.width + this.centerRatioX*this.width;

	var y1 = this.y - ky*this.height + this.centerRatioY*this.height;
	var y2 = this.y + ky*this.height + this.centerRatioY*this.height;

	if (i < x1)
	{
		this.x += i - x1;
	}
	else if (i > x2)
	{
		this.x += i - x2;
	}
	
	if (j < y1)
	{
		this.y += j - y1;
	}
	else if (j > y2)
	{
		this.y += j - y2;
	}

	x1 = this.x - this.width;
	x2 = this.x + this.width;
	y1 = this.y - this.height;
	y2 = this.y + this.height;

	
	if (x1 < this.worldX1) this.x = this.worldX1 + this.width;
	if (x2 > this.worldX2) this.x = this.worldX2 - this.width;

	if (y1 < this.worldY1) this.y = this.worldY1 + this.height;
	if (y2 > this.worldY2) this.y = this.worldY2 - this.height;

	this.updateBounds();
};

/**
**	Tracks a specified object by maintaining focus on it.
*/
Viewport.prototype.setFocusTarget = function (/*DisplayElement*/elem)
{
	this.focusTarget = elem;
	return this;
};

/**
**	Sets the focus factor of the viewport.
*/
Viewport.prototype.setFocusFactor = function (/*float*/valueX, /*float*/valueY)
{
	this.focusFactorX = valueX;
	this.focusFactorY = valueY === undefined ? valueX : valueY;

	return this;
};

/**
**	Updates the viewport.
*/
Viewport.prototype.update = function (/*float*/dt)
{
	if (this.focusTarget != null)
		this.focusOn (this.focusTarget.getX(), this.focusTarget.getY());
};

/**
**	Applies the viewport transform to the specified display buffer.
*/
Viewport.prototype.applyTransform = function (g)
{
	g.translate (this.screenBounds.cx, this.screenBounds.cy);
	g.scale (this.scale, this.scale);
	g.translate (-(~~this.getX()), -(~~this.getY()));
};

/**
**	Converts a point from screen-space to world-space.
*/
Viewport.prototype.toWorldSpace = function (x, y)
{
	x = ((x - this.screenBounds.cx) / this.scale) + this.getX();
	y = ((y - this.screenBounds.cy) / this.scale) + this.getY();

	return { x: x, y: y };
};

/**
**	Converts a point from world-space to screen-space.
*/
Viewport.prototype.toScreenSpace = function (x, y)
{
	x = (x - this.getX()) * this.scale + this.screenBounds.cx;
	y = (y - this.getY()) * this.scale + this.screenBounds.cy;

	return { x: x, y: y };
};
