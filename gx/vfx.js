/*
**	@rsthn/cherry/gx/vfx
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
const Variable = require('./variable');

/**
**
*/

const Vfx = module.exports = VisualElement.extend
({
	className: "Vfx",

	_duration: null,
	_angle: null,
	_scale: null,
	_alpha: null,

	callback: null,

	__ctor: function (x, y, anim)
	{
		this._super.VisualElement.__ctor(x, y, anim);

		if ("onFinished" in anim)
			anim.onFinished (() => this.finished());

		if (Vfx.displayList != null)
			Vfx.displayList.push(this);
	},

	finished: function()
	{
		if (this.callback) this.callback();
		dispose(this);
	},

	onFinished: function(callback)
	{
		this.callback = callback;
		return this;
	},

	duration: function (seconds)
	{
		this._duration = new Variable (0, Easing.Linear.IN, seconds);
		this._duration.onFinished(() => this.finished());
		this._duration.animate (0, seconds, seconds);

		return this;
	},

	rotate: function (startValue, endValue, easing)
	{
		this._angle = new Variable (0, easing || Easing.Linear.IN);
		this._angle.animate (startValue, endValue, this._duration.endValue);

		return this;
	},

	scale: function (startValue, endValue, easing)
	{
		this._scale = new Variable (0, easing || Easing.Linear.IN);
		this._scale.animate (startValue, endValue, this._duration.endValue);

		return this;
	},

	alpha: function (startValue, endValue, easing)
	{
		this._alpha = new Variable (0, easing || Easing.Linear.IN);
		this._alpha.animate (startValue, endValue, this._duration.endValue);

		return this;
	},

	applyTransforms: function(g)
	{
		if (this._angle != null) g.rotate(this._angle.value);
		if (this._scale != null) g.scale(this._scale.value, this._scale.value);
		if (this._alpha != null) g.alpha(this._alpha.value);
	},

	lupdate: function(dt)
	{
		if (this._duration != null) this._duration.update(dt);
		if (this._angle != null) this._angle.update(dt);
		if (this._scale != null) this._scale.update(dt);
		if (this._alpha != null) this._alpha.update(dt);
	}
});

Vfx.displayList = null;
