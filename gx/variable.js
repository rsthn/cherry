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

const { Class } = require('@rsthn/rin');
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

	time: 0, dt: 0,
	defaultDuration: 0, duration: 0,
	startValue: 0, endValue: 0,

	value: null,

	__ctor: function (value, easing, duration)
	{
		this.startValue = this.endValue = this.value = value || 0;
		this.ivalue = 0;

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
		this.time = this.dt = 0;
		this.enabled = true;

		this.value = this.getValueAt(0);
		this.ivalue = 0;

		return this;
	},

	onFinished: function (callback)
	{
		this.callback = callback;
		return this;
	},

	getValueAt: function (t)
	{
		return this.easing(t) * (this.endValue - this.startValue) + this.startValue;
	},

	range: function (startValue, endValue, duration, callback)
	{
		this.startValue = startValue;
		this.endValue = endValue;

		this.duration = duration || this.defaultDuration;
		this.callback = callback || this.callback;

		return this.restart();
	},

	delta: function (deltaValue, duration, callback)
	{
		return this.range (this.value, this.endValue+deltaValue, duration, callback);
	},

	set: function (value)
	{
		this.enabled = false;

		this.value = value;
		this.ivalue = 0;

		return this;
	},

	update: function(dt)
	{
		if (this.enabled == false)
			return;

		if (this.duration != -1 && this.time == this.duration)
		{
			this.enabled = false;
			this.ivalue = 0;

			if (this.callback != null)
				this.callback();

			return;
		}

		const ltime = this.time;

		this.time += dt;
		if (this.duration != -1 && this.time > this.duration) this.time = this.duration;

		this.dt = this.time - ltime;

		const x0 = ltime;
		const x1 = this.time;
		const y0 = this.duration != -1 ? this.getValueAt(x0 / this.duration) : this.getValueAt(0);
		const y1 = this.duration != -1 ? this.getValueAt(x1 / this.duration) : this.getValueAt(0);
		const dx = x1 - x0;
		const dy = y1 - y0;

		this.ivalue = dy*0.5*(dx + 2*x0) + y0*dx - dy*x0;
		this.value = y1;
	}
});
