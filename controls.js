/*
**	cherryjs/controls
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

const System = require('./system');

/**
**	Provides utility functions for controls (buttons, sticks, etc).
*/

module.exports = 
{
	/**
	**	Position reference points.
	*/
	LEFT:	0x000,
	RIGHT:	0x001,
	TOP:	0x000,
	BOTTOM:	0x001,
	CENTER: 0x002,

	/**
	**	Returns the X position given a reference value.
	*/
	getXByRef: function (refX)
	{
		return refX == this.CENTER ? (System.screenWidth*0.5) : (refX == this.LEFT ? 0 : System.screenWidth - 1);
	},

	/**
	**	Returns the Y position given a reference value.
	*/
	getYByRef: function (refY)
	{
		return refY == this.CENTER ? (System.screenHeight*0.5) : (refY == this.TOP ? 0 : System.screenHeight - 1);
	},

	/**
	**	Returns the F factor given a reference value.
	*/
	getFByRef: function (ref)
	{
		return ref == this.CENTER ? -0.5 : (ref & 1 ? -1 : 0);
	}
};
