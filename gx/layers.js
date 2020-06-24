/*
**	@rsthn/cherry/gx/layers
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

const Layer = require('./layer');

/*
**	The layers class is a layer that also serves as a container for multiple layers.
*/

const Layers = module.exports = Layer.extend
({
	className: 'Layers',

	list: null,
	clear: false,

	init: function(clear)
	{
		this.list = [];
		this.clear = clear;
	},

	set: function (index, layer)
	{
		if (index < 0) return;
		this.list[index] = layer;
	},

	get: function (index)
	{
		return index < 0 || index >= this.list.length ? null : this.list[index];
	},

	_draw: function (g)
	{
		if (this.clear) g.clear();

		try {
			for (var i = 0; i < this.list.length; i++)
				if (this.list[i]) this.list[i].draw(g);
		}
		catch (e) {
			if (e.message != "FRAME_END") {
				throw e;
			}
		}
	},

	_update: function (dt, dtm)
	{
		try {
			for (var i = 0; i < this.list.length; i++)
				if (this.list[i]) this.list[i].update(dt, dtm);
		}
		catch (e) {
			if (e.message != "FRAME_END")
				throw e;
		}
	}
});

/**
**	Some layer index constants for consistency.
*/

Layers.INDEX_BACK0 		= 0;
Layers.INDEX_BACK1 		= 1;
Layers.INDEX_MAIN0 		= 2;
Layers.INDEX_MAIN1 		= 3;
Layers.INDEX_FRONT0 	= 4;
Layers.INDEX_FRONT1 	= 5;
Layers.INDEX_UI0 		= 6;
Layers.INDEX_UI1 		= 7;
