/*
**	@rsthn/cherry/gx
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

/**
**	The GX module contains helper classes and utilities to make games faster.
*/

module.exports =
{
	PriorityQueue: require('./gx/priority-queue'),
	Boot: require('./gx/boot'),

	PointerHandler: require('./gx/pointer-handler'),
	KeyboardHandler: require('./gx/keyboard-handler'),
	ScreenControls: require('./gx/screen-controls'),

	VisualElement: require('./gx/visual-element'),
	VisualButton: require('./gx/visual-button'),
	
	DisplayList: require('./gx/display-list'),
	Vfx: require('./gx/vfx'),
	Layer: require('./gx/layer'),
	Layers: require('./gx/layers'),
	Gamepad: require('./gx/gamepad'),
	Variable: require('./gx/variable'),
	Sfx: require('./gx/sfx')
};
