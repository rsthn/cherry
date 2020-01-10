/*
**	cherryjs/core/globals
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
**	Global functions and definitions.
*/

/**
**	Disposes an object, first by checking if it has a 'dispose' method, and if not, tried to check
**	with a '__dtor' method.
**
**	>> dispose (object obj, string reason);
**	>> dispose (object obj);
*/

globalThis.dispose = function (obj, reason)
{
	if (!obj) return;

	if ('dispose' in obj)
	{
		obj.dispose(reason);
		return;
	}

	if ('__dtor' in obj) obj.__dtor();
};


/**
**	Creates a global AudioContext if supported.
*/

if ('AudioContext' in globalThis)
	globalThis.audioContext = new AudioContext();
else
	globalThis.audioContext = null;


/**
**	Detect if running headless (on NodeJS instead of a browser).
*/

if (!('document' in globalThis))
	globalThis.HEADLESS = true;
else
	globalThis.HEADLESS = false;


/**
**	Do some polyfill if running headless.
*/
if (globalThis.HEADLESS)
{
	globalThis.performance = require('perf_hooks').performance;
	globalThis.FileReader = require('filereader');
}


/**
**	Similar to fetch() but uses XMLHttpRequest, as in some mobile browsers normal mode does not work well for ArrayBuffers.
**
**	>> Promise fetchd (string url, object options);
**	>> Promise fetchd (string url);
*/

globalThis.fetchd = function (url, options)
{
	return new Promise ((resolve, reject) =>
	{
		if (!options) options = { };
		if (!('responseType' in options)) options.responseType = 'arraybuffer';

		var request = new XMLHttpRequest();
		request.open('GET', url, true);

		for (var i in options) request[i] = options[i];

		request.onload = function() {
			resolve (request.response);
		};

		request.onerror = function() {
			reject ('Unable to fetch specified resource.');
		};

		request.send();
	});
};


/**
**	Loads an arraybuffer from the specified URL and converts it to a AudioBuffer using the global audioContext.
**
**	>> Promise fetchAudioBuffer (string url);
*/

globalThis.fetchAudioBuffer = function (url)
{
	return new Promise((resolve, reject) =>
	{
		if (!globalThis.audioContext)
		{
			reject ('AudioContext is not available.');
			return;
		}

		fetchd(url)
		.then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
		.then(audioBuffer => resolve(audioBuffer))
		.catch(err => reject(err));
	});
};


/**
**	Returns the value as an integer.
**
**	float int (float value);
*/

globalThis.int = function (value)
{
	return ~~value;
};


/**
**	Returns the value with 2 digits of precision.
**
**	float float2 (float value);
*/

globalThis.float2 = function (value)
{
	return (~~(value*100))/100;
};


/**
**	Returns the value with 3 digits of precision.
**
**	float float3 (float value);
*/

globalThis.float3 = function (value)
{
	return (~~(value*1000))/1000;
};


/**
**	Returns the value with 4 digits of precision.
**
**	float float4 (float value);
*/

globalThis.float4 = function (value)
{
	return (~~(value*10000))/10000;
};


/**
**	Converts the given value to radians.
**
**	float rad (float value);
*/

globalThis.rad = function (value)
{
	return value*Math.PI / 180;
};


/**
**	Returns a random integer value from 0 to 0xFFFF (inclusive).
**
**	int rand ();
*/

globalThis.rand = function ()
{
	return int(Math.random()*0x10000);
};


/**
**	Returns a random float from 0 to 1 (non-inclusive).
**
**	float randf ();
*/

globalThis.randf = function ()
{
	return Math.random();
};


/**
**	Returns a random float within the given (non-inclusive) range.
**
**	float randrf (float a, float b);
*/

globalThis.randrf = function (a, b)
{
	return Math.random()*(b-a) + a;
};


/**
**	Returns a random integer within the given range (inclusive).
**
**	int randr (int a, int b);
*/

globalThis.randr = function (a, b)
{
	return ~~(Math.random()*(b-a+1) + a);
};


/**
**	Returns a table of random float numbers within the given range (non-inclusive).
**
**	array randtf (float a, float b, int n);
*/

globalThis.randtf = function (a, b, n)
{
	var list = [ ];

	for (var i = 0; i < n; i++)
		list.push(randrf(a, b));

	return list;
};


/**
**	Returns the high-resolution 'now' counter in milliseconds.
**
**	int hrnow();
*/

globalThis.hrnow = function ()
{
	return ~~performance.now();
};


/**
**	Returns a function that produces a random integer value within the given (inclusive) range.
**
**	function randvar (int a, int b);
*/

globalThis.randvar = function (a, b)
{
	return function() { return randr(a, b); };
};


/**
**	Returns a function that returns an item from the specified array at some random index within the
**	given inclusive range.
**
**	function randitem (array arr, int a, int b);
**	function randitem (array arr, int a);
**	function randitem (array arr);
*/

globalThis.randitem = function (arr, a, b)
{
	if (!a) a = 0;
	if (!b) b = arr.length - 1;

	return function() { return arr[randr(a, b)]; };
};


/**
**	Returns the parameter 't' where two line segments intersect.
**
**	float lineSegmentIntersects (float ls1_x1, float ls1_y1, float ls1_x2, float ls1_y2, float ls2_x1, float ls2_y1, float ls2_x2, float ls2_y2);
*/

globalThis.lineSegmentIntersects = function (ls1_x1, ls1_y1, ls1_x2, ls1_y2, ls2_x1, ls2_y1, ls2_x2, ls2_y2)
{
	// Case #1: Identical segments.
	if (ls1_x1 == ls2_x1 && ls1_y1 == ls2_y1 && ls1_x2 == ls2_x2 && ls1_y2 == ls2_y2)
		return true;

	var dyA = ls1_y2 - ls1_y1;
	var dxA = ls1_x2 - ls1_x1;
	var dyB = ls2_y2 - ls2_y1;
	var dxB = ls2_x2 - ls2_x1;

	// Case #2: Horizontal vs. Horizontal
	if (dyA == 0 && dyB == 0)
	{
		if (ls1_y1 != ls2_y1) return false;

		var x1 = Math.max(ls1_x1, ls2_x1);
		var x2 = Math.min(ls1_x2, ls2_x2);

		if (x1 > x2) return false;

		return true;
	}

	// Case #3: Vertical vs. Vertical
	if (dxA == 0 && dxB == 0)
	{
		if (ls1_x1 != ls2_x1) return false;

		var y1 = Math.max(ls1_y1, ls2_y1);
		var y2 = Math.min(ls1_y2, ls2_y2);

		if (y1 > y2) return false;

		return true;
	}

	// Case #4: Vertical vs. Horizontal or Sloped
	if (dxA == 0)
	{
		var tA = (dyB*(ls1_x1 - ls2_x1) + dxB*(ls2_y1 - ls1_y1)) / (dxB * dyA);
		if (0 > tA || tA > 1) return false;

		var tB = (ls1_x1 - ls2_x1) / dxB; 
		if (0 > tB || tB > 1) return false;

		return true;
	}

	// Case #5: Regular line segments.
	var a = dyA*(ls2_x1 - ls1_x1) + dxA*(ls1_y1 - ls2_y1);
	var b = dyB*dxA - dxB*dyA;

	if (b == 0) return false;

	var tB = a / b;
	if (0 > tB || tB > 1) return false;

	var tA = (dxB*tB + ls2_x1 - ls1_x1) / dxA;
	if (0 > tA || tA > 1) return false;

	return true;
};


/**
**	Rotates a point (2d) by the given angle and returns an object.
**
**	>> Object{x,y} rotatePoint (Object{x,y} angle, x, y);
**	>> Object{x,y} rotatePoint (float angle, x, y);
*/

globalThis.rotatePoint = function (angle, x, y)
{
	if (Rin.typeOf(angle) == "object")
		return { x: x*angle.x + y*angle.y, y: y*angle.x - x*angle.y };
	else
		return { x: x*Math.cos(angle) + y*Math.sin(angle), y: y*Math.cos(angle) - x*Math.sin(angle) };
};


/**
**	Returns a value snapped to a step within the given range.
**
**	float stepValue (float value, float minValue, float maxValue, int numSteps);
*/

globalThis.stepValue = function (value, minValue, maxValue, numSteps)
{
	return ((~~(numSteps * (value - minValue) / (maxValue - minValue))) / numSteps) * (maxValue - minValue) + minValue;
};
