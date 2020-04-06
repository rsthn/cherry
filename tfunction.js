/*
**	@rsthn/cherry/tfunction
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

/**
**	Describes a function dependent of time (t-function), multiple sampling points (t,y) can be added, this class
**	provides methods to access any value for a given time, or the integral of a time range.
*/

module = Class.extend
({
	className: 'TFunction',

	/**
	**	Contains the time values (t) in the t-function, for each time value there is a corresponding y and f.
	*/
	t: null,

	/**
	**	Contains the values (y) for each of the time values (t) in the t-function.
	*/
	y: null,

	/**
	**	Contains the easing function (f) for each of the time values (t).
	*/
	f: null,

	/**
	**	Constructs the time function with an initial value.
	**
	**	@param value:float Initial value of the t-function for t=0, defaults to 0.
	*/
	__ctor: function (value)
	{
		this.reset (value);
	},

	/**
	**	Resets the t-function to its initial state.
	**
	**	@param value:float Initial value of the t-function for time=0, if none provided zero will be assumed.
	**
	**	@returns TFunction
	*/
	reset: function (value=0)
	{
		this.t = [0];
		this.y = [value];
		this.f = [null];

		return this;
	},

	/**
	**	Resets the t-function and copies data from the specified source.
	**
	**	@param src:TFunction Source TFunction.
	**	@param t0:float Initial time, if none specified will be assumed to be the min time of the source.
	**	@param t1:float Final time, if none specified will be assumed to the the max time of the source.
	**
	**	@returns TFunction or null if the specified time range could not be resolved.
	*/
	copyFrom: function (src, t0, t1)
	{
		this.t = [];
		this.y = [];
		this.f = [];

		if (t0 == null && t1 == null)
		{
			for (let i = 0; i < src.t.length; i++)
				this.set(src.t[i], src.y[i], src.f[i]);

			return this;
		}

		if (t0 == null) t0 = src.t[0];
		if (t1 == null) t1 = src.t[src.t.length-1];

		let i0 = src.find(t0);
		let i1 = src.find(t1);

		if (i0 == null) return null;
		if (i1 == null) return null;

		if (src.t[i0] != t0) {
			this.set(t0, src.getAt(t0), src.f[i0]);
			i0++;
		}

		for (let i = i0; i <= i1; i++)
			this.set(src.t[i], src.y[i], src.f[i]);

		if (src.t[i1] != t1)
			this.set(t1, src.getAt(t1), src.f[i1]);

		return this;
	},

	/**
	**	Creates a new t-function with the same values as this.
	**
	**	@param t0:float Initial time, if none specified will be assumed to be the min time of the source.
	**	@param t1:float Final time, if none specified will be assumed to the the max time of the source.
	**
	**	@returns TFunction
	*/
	clone: function (t0, t1)
	{
		return (new TFunction()).copyFrom(this, t0, t1);
	},

	/**
	**	Returns the maximum time value in the t-function plus the given delta.
	**
	**	@param delta:float Delta value to add to the result.
	**	@returns float
	*/
	time: function (delta=0)
	{
		return this.t[this.t.length-1] + delta;
	},

	/**
	**	Finds the index of a sampling point whose sampling range contains the given time.
	** 
	**	@param time:float Time value to search.
	**
	**	@returns int Index of the sampling point or `null` if not within range.
	*/
	find: function (time)
	{
		if (time < this.t[0])
			return null;

		const n = this.t.length;

		for (let i = 1; i < n; i++)
		{
			if (time < this.t[i])
				return i-1;
		}

		return n-1;
	},

	/**
	**	Sets a sampling point (t,y).
	**
	**	@param t:float Time value of the sampling point.
	**	@param y:float Y-value for the given t.
	**
	**	@returns bool Indicates if operation was successful.
	*/
	set: function (t, y, f=null)
	{
		let i = this.find(t);
		if (i == null) return false;

		if (this.t[i] == t)
		{
			this.y[i] = y;
			if (f != null) this.f[i] = f;
		}
		else
		{
			i++;
			this.t.splice(i, 0, t);
			this.y.splice(i, 0, y);
			this.f.splice(i, 0, f);
		}

		return true;
	},

	/**
	**	Returns the last Y-value in the t-function.
	**
	**	@returns float Y-value.
	*/
	get: function ()
	{
		return this.y[this.y.length-1];
	},

	/**
	**	Returns the Y-value in the t-function corresponding to some point in time (t).
	**
	**	@param t:float Time (t) value.
	**
	**	@returns float Y-value.
	*/
	getAt: function (t)
	{
		let i0 = this.find(t);
		if (i0 == null) return 0;

		let i1 = i0 + 1;

		if (this.t[i0] == t || i1 >= this.t.length || this.y[i0] == this.y[i1])
			return this.y[i0];

		let x = t;
		let x0 = this.t[i0];
		let x1 = this.t[i1];
		let y0 = this.y[i0];
		let y1 = this.y[i1];

		t = (x - x0) / (x1 - x0);

		if (this.f[i0] != null)
			t = this.f[i0](t);

		return t*y1 + (1-t)*y0;
	},

	/**
	**	Returns the approximate definite integral of the t-function for the given time range.
	**
	**	@param t0:float Initial time value.
	**	@param t1:float Final time value.
	**
	**	@returns float Definite integral of t-function from t0 to t1.
	*/
	integral: function (t0, t1)
	{
		if (t0 == null) t0 = this.t[0];
		if (t1 == null) t1 = this.t[this.t.length-1];

		if (t0 > t1) {
			let tmp;
			tmp = t0; t0 = t1; t1 = tmp;
		}

		let accum = 0;

		for (let time = t0; time < t1; )
		{
			let i0 = this.find(time);
			if (i0 == null) return 0;

			let i1 = i0 + 1;

			let x0 = Math.max(this.t[i0], time);
			let x1 = Math.min(i1 < this.t.length ? this.t[i1] : t1, t1);

			let y0 = this.getAt(x0);
			let y1 = this.getAt(x1);

			let dx = x1 - x0;
			let dy = y1 - y0;

			accum += 0.5*dy*(x1+x0) - x0*dy + y0*dx;
			time += dx;
		}

		return accum;
	},

	/**
	**	Transforms the t-function to its integral. For every sampling range in the t-function their Y-value will be set to the integral
	**	of the sampling range plus any previous integrals.
	**
	**	@param c0:float Constant of integration, if none specified 0 will be assumed.
	**
	**	@returns TFunction
	*/
	integrate: function (c0=0)
	{
		let y = [];

		y.push(c0);

		for (let i = 1; i < this.t.length; i++)
			y.push(y[i-1] + this.integral(this.t[i-1], this.t[i]));

		this.y = y;
		return this;
	},

	/**
	**	Transforms the t-function Y-values to the accumulated sum of each Y-value plus the given c0.
	**
	**	@returns TFunction
	*/
	accumulate: function (c0=0)
	{
		this.y[0] += c0;

		for (let i = 1; i < this.t.length; i++)
			this.y[i] += this.y[i-1];

		return this;
	},

	/**
	**	Removes all sampling-points located before the given index.
	**
	**	@returns TFunction
	*/
	truncate: function (i)
	{
		this.t.splice(0, i);
		this.f.splice(0, i);
		this.y.splice(0, i);

		return this;
	},

	/**
	**	Returns a string representation of the variable state.
	**
	**	@returns string
	*/
	toString: function(n)
	{
		let s = '';

		const pad = function (value, n, char)
		{
			value = value.toString();

			if (char == null) char = ' ';
			char = char[0];

			while (value.length < n)
				value += char;

			return value;
		};

		n = n != null ? n : 10;

		s += '\n';
		s += pad(' Time', n) + ' ' + pad(' Value', n) + ' ' + pad(' Integral', n) + '\n';
		s += pad('', n, '-') + ' ' + pad('', n, '-') + ' ' + pad('', n, '-') + '\n';

		for (let i = 0; i < this.t.length; i++)
		{
			s += pad(' '+this.t[i], n) + ' ' + pad(' '+this.y[i], n) + ' ' + pad(' '+this.integral(this.t[0], this.t[i]), n) + '\n';
		}

		return s;
	}
});
