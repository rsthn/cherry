/*
**	flow/scene.js
**
**	Copyright (c) 2013-2021, RedStar Technologies, All rights reserved.
**	https://rsthn.com/
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

import Element from './element.js';

/*
**	An scene is a set of containers in specific order.
*/

const Scene = Element.extend
({
	className: 'Scene',

	/*
	**	List of containers.
	*/
	layers: null,

	/*
	**	Constructor, sets all pre-defined layer numbers to null.
	*/
	__ctor: function (numLayers=null)
	{
		this._super.Element.__ctor();

		this.layers = [];
		this.container = false;

		if (numLayers === null)
			numLayers = 8;

		for (let i = 0; i < numLayers; i++)
			this.layers.push(null);
	},

	/*
	**	Sets a layer at the specified index.
	*/
	set: function (index, layer)
	{
		if (index < 0 || index >= this.layers.length)
			return;

		this.layers[index] = layer;
		return layer;
	},

	/*
	**	Returns the layer at the specified index.
	*/
	get: function (index)
	{
		return index < 0 || index >= this.layers.length ? null : this.layers[index];
	},

	/*
	**	Draws the layers in order.
	*/
	elementDraw: function (g)
	{
		try {
			for (let i = 0; i < this.layers.length; i++)
				if (this.layers[i]) this.layers[i].draw(g);
		}
		catch (e) {
			if (e.message != "SYS::FRAME_END") {
				throw e;
			}
		}
	},

	/*
	**	Updates the layers.
	*/
	elementUpdate: function (dt)
	{
		try {
			for (let i = 0; i < this.layers.length; i++)
				if (this.layers[i]) this.layers[i].update(dt);
		}
		catch (e) {
			if (e.message != "SYS::FRAME_END")
				throw e;
		}
	}
});

/**
**	Some layer index constants for consistency.
*/

Scene.LAYER_BACK0 		= 0;
Scene.LAYER_BACK1 		= 1;
Scene.LAYER_MAIN0 		= 2;
Scene.LAYER_MAIN1 		= 3;
Scene.LAYER_FRONT0 		= 4;
Scene.LAYER_FRONT1 		= 5;
Scene.LAYER_UI0 		= 6;
Scene.LAYER_UI1 		= 7;

export default Scene;
