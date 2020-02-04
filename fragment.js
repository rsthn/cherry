/*
**	@rsthn/cherry/fragment
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

const QuadTreeItem = require('./quadtree-item');
const DisplayElement = require('./display-element');

/**
**	Describes a rectangular 2D display element.
*/

const Fragment = module.exports = QuadTreeItem.extend
({
	/**
	**	Parent element of the collision fragment.
	*/
	parent: null,

	/**
	**	Constructs a fragment with the specified parameters.
	*/
	__ctor: function (parent, dx, dy, width, height)
	{
		this._super.QuadTreeItem.__ctor();

		this.parent = parent;

		this.setFlags (DisplayElement.FLAG_FRAGMENT | QuadTreeItem.FLAG_CHILD);
		this.setType (parent.getType());

		this.bounds.set(parent.bounds);
		this.lbounds.set(parent.bounds);

		this.bounds.translate (dx, dy);
		this.lbounds.translate (dx, dy);

		this.bounds.resize (width, height);
		this.lbounds.resize (width, height);
	},

	/**
	**	Translates the fragment using the specified deltas (dw is used for the W-value).
	*/
	translate: function (dx, dy)
	{
		this.bounds.translate (dx, dy);
		this.lbounds.translate (dx, dy);
	}
});
