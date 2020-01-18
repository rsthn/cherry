/*
**	@rsthn/cherry/anim
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

const Rin = require('@rsthn/rin/alpha');
const Class = require('@rsthn/rin/class');

/**
**	Class to animate properties using different
*/

const Anim = module.exports = Class.extend
({
	list: null,

	initialData: null,
	data: null,

	stack: null,
	block: null,

	time: 0, blockTime: 0,
	index: 0,

	paused: false,
	finished: false,

	__ctor: function ()
	{
		this.list = [ ];

		this.initialData = { };
		this.data = { };

		this.stack = [ ];
		this.block = this.list;

		this.reset();
	},

	__dtor: function ()
	{
	},

	clone: function ()
	{
		var a = new Anim();

		a.list = this.list;
		a.initialData = this.initialData;

		return a.reset();
	},

	onFinished: function ()
	{
	},

	// Resets the animation to its initial state.
	reset: function ()
	{
		this.stack.length = 0;
		this.blockTime = 0;

		this.time = 0;
		this.index = 0;

		this.block = this.list;

		this.paused = false;
		this.finished = false;

		for (var i in this.initialData)
			this.data[i] = this.initialData[i];

		return this;
	},

	// Sets the initial data.
	initial: function (data)
	{
		this.initialData = data;
		return this.reset();
	},

	// Sets the output data object.
	setOutput: function (data)
	{
		this.data = data;
		return this;
	},

	// Pauses the animation.
	pause: function ()
	{
		this.paused = true;
	},

	// Resumes the animation.
	resume: function ()
	{
		this.paused = false;
	},

	// Updates the animation by the specified delta time, ensure the time is specified in the same units as the duration of the actions.
	update: function (dt)
	{
		if (this.paused) return false;

		if (this.index >= this.block.length)
			return true;

		var i = 0;

		this.time += dt;

		while (this.index < this.block.length)
		{
			var cmd = this.block[this.index];
			var duration;

			switch (cmd.op)
			{
				case "parallel":
					if (cmd.started == false)
					{
						cmd.blocks.length = 0;
						cmd.started = true;

						for (i = 0; i < cmd.block.length; i++)
						{
							cmd.blocks.push([cmd.block[i]]);
							cmd.indices[i] = 0;
							cmd.blockTimes[i] = this.blockTime;
						}
					}

					var _block = this.block;
					var _index = this.index;
					var _blockTime = this.blockTime;

					var n = 0;
					var blockTime = _blockTime;

					for (i = 0; i < cmd.blocks.length; i++)
					{
						this.block = cmd.blocks[i];
						this.index = cmd.indices[i];
						this.blockTime = cmd.blockTimes[i];

						if (this.update(0) === true)
							n++;

						if (this.blockTime > blockTime)
							blockTime = this.blockTime;

						cmd.blockTimes[i] = this.blockTime;
						cmd.blocks[i] = this.block;
						cmd.indices[i] = this.index;
					}

					this.block = _block;
					this.index = _index;
					this.blockTime = _blockTime;

					if (cmd.fn) cmd.fn.call(this);

					if (n != cmd.blocks.length)
						return false;

					cmd.started = false;

					this.blockTime = blockTime;
					this.index++;
					break;

				case "serial":
					if (cmd.started == false)
					{
						cmd._block = cmd.block;
						cmd._index = 0;
						cmd._blockTime = this.blockTime;

						cmd.started = true;
					}

					var _block = this.block;
					var _index = this.index;
					var _blockTime = this.blockTime;

					this.block = cmd._block;
					this.index = cmd._index;
					this.blockTime = cmd._blockTime;

					i = this.update(0);

					cmd._block = this.block;
					cmd._index = this.index;
					cmd._blockTime = this.blockTime;

					this.block = _block;
					this.index = _index;
					this.blockTime = _blockTime;

					if (i !== true) return false;

					cmd.started = false;

					this.blockTime = cmd._blockTime;
					this.index++;
					break;

				case "repeat":
					if (cmd.started == false)
					{
						cmd._block = cmd.block;
						cmd._index = 0;
						cmd._blockTime = this.blockTime;
						cmd._count = cmd.count;

						cmd.started = true;
					}

					var _block = this.block;
					var _index = this.index;
					var _blockTime = this.blockTime;

					this.block = cmd._block;
					this.index = cmd._index;
					this.blockTime = cmd._blockTime;

					i = this.update(0);

					cmd._block = this.block;
					cmd._index = this.index;
					cmd._blockTime = this.blockTime;

					this.block = _block;
					this.index = _index;
					this.blockTime = _blockTime;

					if (i !== true) return false;

					if (cmd._count <= 1)
					{
						cmd.started = false;

						this.blockTime = cmd._blockTime;
						this.index++;

						return false;
					}
					else
					{
						cmd._index = 0;
						cmd._count--;

						return false;
					}

					break;

				case "set":
					this.data[cmd.field] = cmd.value;
					this.index++;
					break;

				case "restart":
					this.index = 0;
					break;

				case "wait":
					duration = Rin.typeOf(cmd.duration) == "string" ? this.data[cmd.duration] : cmd.duration;

					if (this.time < this.blockTime + duration)
						return false;

					this.blockTime += duration;
					this.index++;
					break;

				case "range":
					if (cmd.started == false)
					{
						if (cmd.startValue === null)
							cmd._startValue = this.data[cmd.field];
						else
							cmd._startValue = cmd.startValue;

						cmd._endValue = cmd.endValue;

						cmd.started = true;
					}

					duration = Rin.typeOf(cmd.duration) == "string" ? this.data[cmd.duration] : cmd.duration;

					if (this.time < this.blockTime + duration)
						dt = (this.time - this.blockTime) / duration;
					else
						dt = 1;

					if (cmd.easing && dt != 1.0)
						this.data[cmd.field] = cmd.easing(dt)*(cmd._endValue - cmd._startValue) + cmd._startValue;
					else
						this.data[cmd.field] = dt*(cmd._endValue - cmd._startValue) + cmd._startValue;

					if (dt != 1) return false;

					cmd.started = false;

					this.blockTime += duration;
					this.index++;
					break;

				case "rand":
					if (cmd.started == false)
					{
						cmd.started = true;
						cmd.last = null;
					}

					duration = Rin.typeOf(cmd.duration) == "string" ? this.data[cmd.duration] : cmd.duration;

					if (this.time < this.blockTime + duration)
						dt = (this.time - this.blockTime) / duration;
					else
						dt = 1;

					if (cmd.easing && dt != 1)
						cmd.cur = ~~(cmd.easing(dt)*cmd.count);
					else
						cmd.cur = ~~(dt*cmd.count);

					if (cmd.cur != cmd.last)
					{
						while (true) {
							i = ~~(Math.random()*(cmd.endValue - cmd.startValue + 1)) + cmd.startValue;
							if (i != this.data[cmd.field]) break;
						}

						this.data[cmd.field] = i;
						cmd.last = cmd.cur;
					}

					if (dt != 1) return false;

					cmd.started = false;

					this.blockTime += duration;
					this.index++;
					break;

				case "randt":
					duration = Rin.typeOf(cmd.duration) == "string" ? this.data[cmd.duration] : cmd.duration;

					if (this.time < this.blockTime + duration)
						dt = (this.time - this.blockTime) / duration;
					else
						dt = 1;

					if (cmd.easing && dt != 1)
						i = cmd.easing(dt)*(cmd.count-1);
					else
						i = dt*(cmd.count-1);

					this.data[cmd.field] = cmd.table[~~((i + cmd.count) % cmd.count)];

					if (dt != 1) return false;

					this.blockTime += duration;
					this.index++;
					break;

				case "play":
					//if (cmd.snd instanceof Sound)
					cmd.snd.play();
					//else
					//cmd.snd.wrapper.play();

					this.index++;
					break;

				case "exec":
					cmd.fn.call(this);
					this.index++;
					break;
			}
		}

		if (this.block == this.list)
		{
			if (!this.finished)
				this.onFinished();

			this.finished = true;
		}

		return true;
	},

	// Runs the subsequent commands in parallel. Should end the parallel block by calling end().
	parallel: function ()
	{
		var block = [ ];

		this.block.push({ op: "parallel", started: false, block: block, blocks: [ ], indices: [ ], blockTimes: [ ] });

		this.stack.push (this.block);
		this.block = block;

		return this;
	},

	// Runs the subsequent commands in series. Should end the serial block by calling end().
	serial: function ()
	{
		var block = [ ];

		this.block.push({ op: "serial", started: false, block: block });

		this.stack.push (this.block);
		this.block = block;

		return this;
	},

	// Repeats a block the specified number of times.
	repeat: function (count)
	{
		var block = [ ];

		this.block.push({ op: "repeat", started: false, block: block, count: count });

		this.stack.push (this.block);
		this.block = block;

		return this;
	},

	// Sets the callback of the current block.
	callback: function (fn)
	{
		var block = this.stack[this.stack.length-1];
		block[block.length-1].fn = fn;

		return this;
	},

	// Ends a parallel() or serial() block.
	end: function ()
	{
		this.block = this.stack.pop();
		return this;
	},

	// Sets the value of a variable.
	set: function (field, value)
	{
		this.block.push({ op: "set", field: field, value: value });
		return this;
	},

	// Restarts the current block.
	restart: function (duration)
	{
		this.block.push({ op: "restart" });
		return this;
	},

	// Waits for the specified duration.
	wait: function (duration)
	{
		this.block.push({ op: "wait", duration: duration });
		return this;
	},

	// Sets the range of a variable.
	range: function (field, duration, startValue, endValue, easing)
	{
		this.block.push({ op: "range", started: false, field: field, duration: duration, startValue: startValue, endValue: endValue, easing: easing ? easing : null });
		return this;
	},

	// Generates a certain amount of random numbers in the given range (inclusive).
	rand: function (field, duration, count, startValue, endValue, easing)
	{
		this.block.push({ op: "rand", started: false, field: field, duration: duration, count: count, startValue: startValue, endValue: endValue, easing: easing ? easing : null });
		return this;
	},

	// Generates a certain amount of random numbers in the given range (inclusive). This uses a static random table to determine the next values.
	randt: function (field, duration, count, startValue, endValue, easing)
	{
		var table = [ ];

		for (var i = 0; i < count; i++)
			table.push ((i % (endValue - startValue + 1)) + startValue);

		for (var i = count >> 2; i > 0; i--)
		{
			var a = ~~(Math.random() * count);
			var b = ~~(Math.random() * count);

			var c = table[b];
			table[b] = table[a];
			table[a] = c;
		}

		this.block.push({ op: "randt", field: field, duration: duration, count: count, startValue: startValue, endValue: endValue, table: table, easing: easing ? easing : null });
		return this;
	},

	// Plays a sound.
	play: function (snd)
	{
		this.block.push({ op: "play", snd: snd });
		return this;
	},

	// Executes a function.
	exec: function (fn)
	{
		this.block.push({ op: "exec", fn: fn });
		return this;
	}
});
