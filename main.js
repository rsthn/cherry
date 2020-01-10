/*
**	cherryjs/main
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

require('./core/globals');

module.exports =
{
	Matrix: require('./core/matrix'),
	Canvas: require('./core/canvas'),

	Perf: require('./core/perf'),
	Timer: require('./core/timer'),

	Linkable: require('./core/linkable'),
	List: require('./core/list'),

	System: require('./core/system'),
	Resources: require('./core/resources'),

	Vec2: require('./core/vec2'),
	Rect: require('./core/rect'),

	Viewport: require('./core/viewport'),
	QuadTreeItem: require('./core/quadtreeitem'),
	QuadTreeNode: require('./core/quadtreenode'),
	QuadTree: require('./core/quadtree'),

	DisplayElement: require('./core/displayelement'),
	World: require('./core/world'),

	Easing: require('./core/easing'),
	Anim: require('./core/anim')
};
