/*
**	@rsthn/cherry/wrappers
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

const System = require('./system');

/**
**	Logging module to show logs on the system display buffer.
*/

const Log = module.exports =
{
	enabled: false,

	data: [ ],
	count: 0,
	maxsize: 30,
	debugEcho: false,

	color: '#fff',
	background: '#000',

	write: function (msg)
	{
		if (!this.enabled) this.enable();

		this.data.push(msg);
		this.count++;

		while (this.data.length > this.maxsize)
			this.data.shift();

		if (this.debugEcho)
			console.debug(this.count + ": " + msg);
	},

	clear: function ()
	{
		this.data = [];
		this.count = 0;
	},

	enable: function (x, y, fontSize, showFps, showIndex)
	{
		if (this.enabled) return;
		this.enabled = true;

		if (!x) x = 0;
		if (!y) y = 0;

		if (!fontSize) fontSize = 12;

		if (showFps === false) y -= 16;

		System.drawQueueAdd ({ draw: function (g)
		{
			g.font("normal "+fontSize+"px 'Bitstream Vera Sans Mono', monospace");

			var _time = ((System.perf.lastTime - System.perf.startTime) / 1000);
			var _frames = System.perf.numFrames;
			var s = '';

			if (showFps !== false)
			{
				s = 'FPS: '+(_frames/_time).toFixed(2) + ', update: ' + (System.perf.updateTime/_frames).toFixed(2) + ', draw: ' + (System.perf.drawTime/_frames).toFixed(2);

				if (Log.background) {
					g.fillStyle(Log.background);
					g.fillRect (x+10-2, y+10-2, g.measureText(s)+4, fontSize+4);
				}

				g.fillStyle(Log.color);
				g.fillText(s, x+10, y+20);
			}

			for (var i = 0; i < Log.data.length; i++)
			{
				s = (showIndex !== false ? "#" + (Log.count-Log.data.length+i+1) + ": " : "> ") + Log.data[i];

				if (Log.background) {
					g.fillStyle(Log.background);
					g.fillRect (x+10-2, y+10+16*(i+1)-2, g.measureText(s)+4, fontSize+4);
				}

				g.fillStyle(Log.color);
				g.fillText(s, x+10, y+20+16*(i+1));
			}
		}});
	}
};
