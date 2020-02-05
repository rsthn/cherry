/*
**	@rsthn/cherry/wrappers/spritesheet-animation
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

const Class = require('@rsthn/rin/class');
const SpriteSheet = require('./spritesheet');
const System = require('../system');

/*
	anim: {
		def: string, fps: int?,

		seq: {
			seq1: { loop: bool?, group: [ [int, int, ...], ... ] },
			seq2: { loop: bool?, group: [ [int, int, ...], ... ] },
			seq2: { loop: bool?, group: "0,12" },
			seq2: { loop: bool?, group: "4" },
		},

		trans: {
			seq1: {
				seq2: [ seq_name, seq_name, ... ]
			}
		}
	}

	NOTE: When specifying a group such as "0,12" it means to draw tiles 0 and the 12 in that single frame.
*/

const Animation = Class.extend
({
	seq: null, seq_i: 0,
	trans: null, trans_i: 0, trans_t: null,

	queue: null,

	fps: 0, frameMillis: 0, time: 0,

	frameNumber: -1,

	finished: false,
	paused: false,

	width: null,
	height: null,

	onFinishedCallback: null,
	onFinishedArg: null,

	onFrameCallback: null,
	onFrameArg: null,

	__ctor: function (anim, seq, fps)
	{
		this.anim = anim;
		this.queue = [ ];

		this.seq = seq;
		this.trans = null;

		this.width = anim.width;
		this.height = anim.height;

		this.fps = fps;

		this.setFps (this.seq.fps || this.fps);
	},

	__dtor: function ()
	{
	},

	setFps: function (fps)
	{
		this.frameMillis = ~~(1000 / fps);
		this.time = 0;

		return this;
	},

	setPaused: function (value)
	{
		this.paused = value;
		return this;
	},

	setInitialDelay: function (dt)
	{
		this.time = -dt*1000.0;
		return this;
	},

	onFinished: function (fn, arg)
	{
		this.onFinishedCallback = fn;
		this.onFinishedArg = arg;
		return this;
	},

	onFrame: function (fn, arg)
	{
		this.onFrameCallback = fn;
		this.onFrameArg = arg;
		return this;
	},

	setFrame: function (i)
	{
		this.seq_i = i % this.seq.group.length;
		return this;
	},

	getFrame: function (normalized)
	{
		return normalized === true ? (this.seq_i / (this.seq.group.length-1)) : this.seq_i;
	},

	getLength: function ()
	{
		return this.seq.group.length;
	},

	draw: function (g, x, y)
	{
		if (this.time < 0)
		{
			if (!this.paused)
			{
				this.time += this.frameNumber == System.frameNumber ? 0 : System.frameDelta;
				this.frameNumber = System.frameNumber;
			}

			if (this.time > 0) this.time = 0;
			return;
		}

		if (this.seq_i == this.seq.group.length)
		{
			var t = this.seq.group[this.seq_i-1];

			if (g != null)
			{
				for (var i = 0; i < t.length; i++)
					g.drawFrame (this.anim, x, y, t[i]);
			}

			return;
		}

		var t = this.seq.group[this.seq_i];

		if (g != null)
		{
			for (var i = 0; i < t.length; i++)
				g.drawFrame (this.anim, x, y, t[i]);
		}

		if (!this.paused)
		{
			this.time += this.frameNumber == System.frameNumber ? 0 : System.frameDelta;
			this.frameNumber = System.frameNumber;
		}

		if (this.time >= this.frameMillis)
		{
			const frameIndex = this.seq_i;

			this.time -= this.frameMillis;
			this.seq_i++;

			if (this.seq_i == this.seq.group.length)
			{
				if (this.trans != null)
				{
					if (++this.trans_i == this.trans.length)
					{
						this.trans = null;
						this.seq = this.trans_t;
					}
					else
						this.seq = this.trans[this.trans_i];

					this.seq_i = 0;
					this.time = 0;

					this.finished = false;
				}
				else
				{
					if (this.seq.loop)
						this.seq_i = 0;
					else
					{
						this.finished = true;

						if (this.onFinishedCallback)
						{
							this.onFinishedCallback(this.onFinishedArg);
							this.onFinishedCallback = null;
						}
					}

					if (this.queue.length)
						this.use(this.queue.shift(), true);
				}
			}

			if (this.onFrameCallback)
			{
				if (this.onFrameCallback(frameIndex, this.seq.group.length, this.onFrameArg) === false)
					this.onFrameCallback = null;
			}
		}
	},

	advance: function ()
	{
		this.setPaused (false);
		this.draw (null, 0, 0);
	},

	use: function (seqName, force)
	{
		var seq = this.trans == null ? this.seq : this.trans_t;

		if (seq.name == seqName && force !== true)
			return this;

		if (seq.trans && seq.trans[seqName])
		{
			this.trans_t = this.anim.a.seq[seqName];

			this.trans = seq.trans[seqName];
			this.trans_i = 0;

			this.seq = this.trans[this.trans_i];
		}
		else
		{
			this.seq = this.anim.a.seq[seqName];
			this.setFps (this.seq.fps || this.fps);
		}

		this.seq_i = 0;
		this.time = 0;

		this.finished = false;
		return this;
	},

	setQueue: function (list)
	{
		this.queue = list;
		this.use(this.queue.shift(), true);
	},

	enqueue: function (seqName, force)
	{
		var seq = this.trans == null ? this.seq : this.trans_t;

		if (seq.name == seqName && seq.loop)
			return this;

		if (force !== true && this.queue.length > 0 && this.queue[this.queue.length-1] == seqName)
			return this;

		if (seq.loop || this.finished)
		{
			this.use(seqName, true);
			return this;
		}

		this.queue.push(seqName);
		return this;
	}
});



const SpriteSheetAnimation = module.exports = SpriteSheet.extend
({
	className: "SpriteSheetAnimation",

	__ctor: function (r)
	{
		if (!r.anim) throw new Error ("Animation descriptors not found.");

		this._super.SpriteSheet.__ctor (r);

		this.r = r;
		this.r.wrapper = this;

		var t = this.a = this.r.anim;

		if (t.initialized) return;

		if (!t.def) t.def = "def";

		if (!t.seq) t.seq = { };

		if (!t.seq[t.def] && (t.def == "def" || t.def == "defloop"))
		{
			var p = { loop: (t.def == "def" ? false : true), group: [ ] };

			for (var i = 0; i < this.numFrames; i++)
			{
				p.group.push([i]);
			}

			t.seq[t.def] = p;
		}

		if (!t.seq[t.def])
			throw new Error ("Undefined default sequence: " + t.def);

		if (!t.fps) t.fps = 25;

		t.def = t.seq[t.def];

		var frameIndex = 0;

		for (var i in t.seq)
		{
			t.seq[i].name = i;

			if (!t.seq[i].loop)
				t.seq[i].loop = false;

			if (typeof(t.seq[i].group) == "string")
			{
				var a, b, c;

				if (t.seq[i].group.indexOf(" ") != -1)
				{
					a = t.seq[i].group.split(" ");
					t.seq[i].group = [ ];

					for (var j in a)
						t.seq[i].group.push([int(a[j])]);
				}
				else if (t.seq[i].group.indexOf(",") != -1)
				{
					c = t.seq[i].group.split(",");
					
					a = int(c[0]);
					b = int(c[1]);

					t.seq[i].group = [ ];

					for (c = a; c <= b; c++)
						t.seq[i].group.push([c]);
				}
				else
				{
					a = int(t.seq[i].group);
					t.seq[i].group = [ ];

					while (a--) t.seq[i].group.push([frameIndex++]);
				}
			}
		}

		if (t.trans)
		{
			for (var i in t.trans)
			{
				t.seq[i].trans = t.trans[i];

				for (var j in t.trans[i])
				{
					for (var k = 0; k < t.trans[i][j].length; k++)
					{
						var n = t.trans[i][j][k];

						if (!t.seq[n]) throw new Error ("Undefined sequence: " + n);
						t.trans[i][j][k] = t.seq[n];
					}
				}
			}
		}

		t.initialized = true;
	},

	getDrawable: function (initialseq, fps)
	{
		return new Animation (this, initialseq ? this.a.seq[initialseq] : this.a.def, fps || this.a.fps);
	},

	getSequence: function (initialseq)
	{
		return initialseq ? this.a.seq[initialseq] : this.a.def;
	}
});
