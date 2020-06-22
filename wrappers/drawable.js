/*
**	@rsthn/cherry/wrappers/drawable
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

const { Class } = require('@rsthn/rin');

module.exports = Class.extend
({
	className: "Drawable",

	width: null,
	height: null,

	__ctor: function (r)
	{
		if (r.type != "image")
			throw new Error ("Resource is not an image.");

		this.r = r;
		this.r.wrapper = this;

		this.width = this.r.width;
		this.height = this.r.height;
	},

	draw: function (g, x, y, width, height)
	{
		if (width == null)
			g.drawImageResource (this.r, x, y);
		else
			g.drawImageResource (this.r, x, y, width, height);
	},

	getDrawable: function ()
	{
		return this;
	}
});
