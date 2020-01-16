/*
**	@rsthn/cherry/gx/variable
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
const Easing = require('../easing');

/**
**
*/

module.exports = Class.extend
({
	className: 'Variable',

	enabled: false,
	easing: null,
	callback: null,

	time: 0, defaultDuration: 0, duration: 0,
	startValue: 0, endValue: 0,

	value: null,

	__ctor: function (value, easing, duration)
	{
		this.value = this.startValue = this.endValue = value || 0;
		this.easing = easing || Easing.Linear.IN;
		this.defaultDuration = this.duration = duration || 0.500;
	},

	isFinished: function()
	{
		return this.enabled == false;
	},

	setEasing: function (easing)
	{
		this.easing = easing;
		return this;
	},

	restart: function ()
	{
		this.time = 0;
		this.enabled = true;

		return this;
	},

	onFinished: function (callback)
	{
		this.callback = callback;
		return this;
	},

	animate: function (startValue, endValue, duration, callback)
	{
		this.startValue = startValue;
		this.endValue = endValue;

		this.duration = duration || this.defaultDuration;
		this.callback = callback || this.callback;

		return this.restart();
	},

	delta: function (deltaValue, duration, callback)
	{
		return this.animate(this.value, this.endValue+deltaValue, duration, callback);
	},

	set: function (value)
	{
		this.enabled = false;
		this.value = value;
		return this;
	},

	update: function(dt)
	{
		if (this.enabled == false)
			return;

		this.time += dt;
		if (this.time > this.duration) this.time = this.duration;

		this.value = this.easing(this.time / this.duration) * (this.endValue - this.startValue) + this.startValue;

		if (this.time == this.duration)
		{
			this.enabled = false;

			if (this.callback != null)
				this.callback();
		}
	}
});
