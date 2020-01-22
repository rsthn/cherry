/*
**	@rsthn/cherry/gx/background
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

const DisplayElement = require('./../display-element');
const QuadTreeItem = require('./../quadtree-item');

const G = require('./../globals');

/**
**	Background class provides a way to draw a background in the world using different modes.
*/

const Background = module.exports = DisplayElement.extend
({
	/**
	**	Background drawing mode. One of the constants at the end of this class.
	*/
	type: 0,

	/**
	**	The image to be used as background, should be a resources not a wrapper.
	*/
	image: null,

	/**
	**	Indicates the initial position of the background.
	*/
	refX: 0, refY: 0,

	/**
	**	The scroll rates are used only when drawing in tiled mode. See the setScrollRates() method for more information.
	*/
	rateX: 1, rateY: 1,

	/**
	**	Constructs the background with the specified parameters, note that the image should be a resource not a wrapper.
	*/
	__ctor: function(type, x, y, width, height, image)
	{
		this._super.DisplayElement.__ctor(width, height);

		this.type = type;
		this.image = image;

		this.refX = x;
		this.refY = y;

		this.setPosition(x, y, true);

		if (this.type == Background.FIXED)
			this.flags |= QuadTreeItem.FLAG_ALWAYS_SELECT;
	},

	/**
	**	Scroll rates are used only when drawing in tiled mode and they can be noticed only when scrolling. When scrolling, the background should be scrolled
	**	at the same speed as the viewport, but by using scroll rates we can change the speed of scrolling to ensure that an image that is smaller (or larger)
	**	than the full background size will still cover all of the background area.
	**
	**	For example, a background of width 4*W (where W is the width of the image) and a rate of 1, the image will be tiled 4 times to cover the entire background
	**	area. However, if the rate is 1/4 then the image will be just shown once but scrolled slowly with the viewport to cover the entire background area.
	*/
	setScrollRates: function (sx, sy)
	{
		this.rateX = sx;
		this.rateY = sy === undefined ? sx : sy;

		return this;
	},

	/**
	**	Returns the image corresponding to the specified coordinates.
	*/
	getImage: function (x, y)
	{
		x = int((this.fAx*(this.baseX - this.bounds.x1) + (x - this.baseX)) / this.image.width);
		y = int((this.fAy*(this.baseY - this.bounds.y1) + (y - this.baseY)) / this.image.height);

		return this.getImageAt(x, y);
	},

	/**
	**	Returns the image corresponding to the specified indices.
	*/
	getImageAt: function (i, j)
	{
		return this.image;
	},

	drawImageSection: function (g, img, sx, sy, sw, sh, dx, dy, dw, dh)
	{
		var r = img.rscale;
		g.drawImage (img.data, sx*r, sy*r, sw*r, sh*r, dx, dy, dw, dh);
	},

	/**
	**	Draws the background on the specified graphics surface.
	*/
	draw: function (g)
	{
		var viewport = G.viewport.getBounds();

		if (this.type == Background.FIXED)
		{
			this.translate (viewport.x1 - this.bounds.x1 + this.refX, viewport.y1 - this.bounds.y1 + this.refY);
			g.drawImageResource (this.image, this.bounds.x1, this.bounds.y1);

			return;
		}

		if (this.type == Background.TILED)
		{
			var x1 = Math.max(viewport.x1, this.bounds.x1);
			var y1 = Math.max(viewport.y1, this.bounds.y1);

			var x2 = Math.min(viewport.x2, this.bounds.x2);
			var y2 = Math.min(viewport.y2, this.bounds.y2);

			var imgWidth = this.image.width;
			var imgHeight = this.image.height;

			var fullWidth = this.bounds.width();
			var fullHeight = this.bounds.height();

			this.fAx = (viewport.width() - fullWidth*this.rateX) / (viewport.width() - fullWidth);
			this.fBx = (1 - this.fAx)*viewport.width();

			this.fAy = (viewport.height() - fullHeight*this.rateY) / (viewport.height() - fullHeight);
			this.fBy = (1 - this.fAy)*viewport.height();

			// Below are the raw offsX and offsY. Raw offsX indicates the x2 of the background shown in the viewport, ranging from viewportWidth to fullWidth.
			var offsX = (viewport.x2 - this.bounds.x1);
			var offsY = (viewport.y2 - this.bounds.y1);

			// Below are the adjusted offsX and offsY. Adjusted offsX indicates the x1 of the background shown in the viewport, ranging from 0 to fullWidth*rateX-viewportWidth.
			offsX = -offsX + offsX*this.fAx + this.fBx + (x1 - this.bounds.x1);
			offsY = -offsY + offsY*this.fAy + this.fBy + (y1 - this.bounds.y1);

			// Below are the modulus offsX and offsY (wraps around the image width and height).
			offsX = int(offsX % imgWidth);
			offsY = int(offsY % imgHeight);

			this.baseX = x1;
			this.baseY = y1;

/*
	(1) RANGE raw_offsX: viewport.width() .. fullWidth
	(2) RANGE adj_offsX: 0 .. fullWidth*rateX-viewport.width()
	(3) FN adj_offsX(raw_offsX) = -raw_offsX + raw_offsX*fAx + fBx + (x1 - this.bounds.x1)
	(4) CONSTANT: -raw_offsX + (x1 - this.bounds.x1) === -viewport.width()
	(5) OPTIM (3) with (4) => FN adj_offsX(raw_offsX) = raw_offsX*fA + fB - viewport.width()

	(6) Map (1) and (2) for the lower and upper boundaries using (5) to obtain:
		fAx = (viewport.width() - fullWidth*rateX) / (viewport.width() - fullWidth)
		fBx = viewport.width()*(1 - fA)
*/

			var y = y1;

			for (; y+imgHeight < y2; y += imgHeight-offsY, offsY=0)
			{
				var x = x1;

				if (x+imgWidth < x2)
				{
					this.drawImageSection (g, this.getImage(x,y), offsX, offsY, imgWidth - offsX, imgHeight - offsY, x, y, imgWidth - offsX, imgHeight - offsY);
					x += imgWidth - offsX;
				}

				for (; x+imgWidth < x2; x += imgWidth) {
					this.drawImageSection (g, this.getImage(x,y), 0, offsY, imgWidth, imgHeight-offsY, x, y, imgWidth, imgHeight-offsY);
				}

				if (x < x2 && x == x1)
				{
					var k = Math.min(imgWidth - offsX, x2 - x);
					this.drawImageSection (g, this.getImage(x,y), offsX, offsY, k, imgHeight-offsY, x, y, k, imgHeight-offsY);
					x += k;
				}

				if (x < x2) {
					this.drawImageSection (g, this.getImage(x,y), 0, offsY, x2 - x, imgHeight-offsY, x, y, x2 - x, imgHeight-offsY);
				}
			}

			if (y < y2 && y == y1)
			{
				var x = x1;
				var h = Math.min(imgHeight - offsY, y2 - y);

				if (x+imgWidth < x2)
				{
					this.drawImageSection (g, this.getImage(x,y), offsX, offsY, imgWidth - offsX, h, x, y, imgWidth - offsX, h);
					x += imgWidth - offsX;
				}

				for (; x+imgWidth < x2; x += imgWidth) {
					this.drawImageSection (g, this.getImage(x,y), 0, offsY, imgWidth, h, x, y, imgWidth, h);
				}

				if (x < x2 && x == x1)
				{
					var k = Math.min(imgWidth - offsX, x2 - x);
					this.drawImageSection (g, this.getImage(x,y), offsX, offsY, k, h, x, y, k, h);
					x += k;
				}

				if (x < x2) {
					this.drawImageSection (g, this.getImage(x,y), 0, offsY, x2 - x, h, x, y, x2 - x, h);
				}

				y += h;
			}

			if (y < y2)
			{
				var x = x1;

				if (x+imgWidth < x2)
				{
					this.drawImageSection (g, this.getImage(x,y), offsX, 0, imgWidth - offsX, y2 - y, x, y, imgWidth - offsX, y2 - y);
					x += imgWidth - offsX;
				}

				for (; x+imgWidth < x2; x += imgWidth) {
					this.drawImageSection (g, this.getImage(x,y), 0, 0, imgWidth, y2 - y, x, y, imgWidth, y2 - y);
				}

				if (x < x2 && x == x1)
				{
					var k = Math.min(imgWidth - offsX, x2 - x);
					this.drawImageSection (g, this.getImage(x,y), offsX, 0, k, y2 - y, x, y, k, y2 - y);
					x += k;
				}

				if (x < x2) {
					this.drawImageSection (g, this.getImage(x,y), 0, 0, x2 - x, y2 - y, x, y, x2 - x, y2 - y);
				}
			}

			return;
		}

		if (this.type == Background.ABSOLUTE)
		{
			g.drawImageResource (this.image, this.bounds.x1, this.bounds.y1);
			return;
		}
	}
});

/**
**	Types of background drawing modes.
**
**	ABSOLUTE:	Is like placing an image in the world. It will simply be drawn at that position and disappear as the viewport moves away.
**	FIXED:		Similar to ABSOLUTE, but the image is placed in screen-space and will continue to be visible as the viewport moves.
**	TILED:		Tiles the image in the background area and uses the viewport to scroll the image at different speeds to achieve a parallax effect.
*/

Background.ABSOLUTE = 0;
Background.FIXED = 1;
Background.TILED = 2;
