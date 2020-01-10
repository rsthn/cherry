/*
**	cherryjs/core/matrix
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
**	Represents a 3x3 matrix. Provides an interface to manipulate 3x3 matrices.
*/

/**
**	Constructs a Matrix object. The components are set to the identity matrix.
*/

const Matrix = module.exports = function ()
{
	this.data = [1, 0, 0, 0, 1, 0, 0, 0, 1];
};


/**
**	Returns a string representation of the matrix.
**
**	>> string toString()
*/

Matrix.prototype.toString = function ()
{
	return `[${this.data[0]}, ${this.data[1]}, ${this.data[2]}]\n[${this.data[3]}, ${this.data[4]}, ${this.data[5]}]\n[${this.data[6]}, ${this.data[7]}, ${this.data[8]}]\n`;
};


/**
**	Sets the matrix to the zero matrix.
**
**	>> Matrix zero();
*/

Matrix.prototype.zero = function ()
{
	for (var i = 0; i < 9; i++) this.data[i] = 0;
	return this;
};


/**
**	Sets all matrix elements to a given value.
**
**	>> Matrix set (float value);
*/

Matrix.prototype.set = function (value)
{
	for (var i = 0; i < 9; i++) this.data[i] = value;
	return this;
};


/**
**	Sets the matrix to the identity matrix.
**
**	>> Matrix identity();
*/

Matrix.prototype.identity = function ()
{
	for (var i = 0; i < 9; i++) this.data[i] = i&3?0:1;
	return this;
};


/**
**	Multiplies all elements in the matrix by a given scalar.
**
**	>> Matrix scalef (float f);
*/

Matrix.prototype.scalef = function (f)
{
	for (var i = 0; i < 9; i++) this.data[i] *= f;
	return this;
};


/**
**	Returns a new matrix with the same values as this one.
**
**	>> Matrix clone();
*/

Matrix.prototype.clone = function ()
{
	var matr = new Matrix ();

	for (var i = 0; i < 9; i++) matr.data[i] = this.data[i];
	return matr;
};


/**
**	Appends two matrices (the current one and the given one) by using matrix multiplication.
**
**	Matrix append (Matrix matr);
*/

Matrix.prototype.append = function (matr)
{
	var i, j, k, m, temp = [0, 0, 0, 0, 0, 0, 0, 0, 0];

	if (matr["data"]) matr = matr.data;

	for (j = 0; j < 3; j++)
	{
		for (i = 0; i < 3; i++)
		{
			m = 0;

			for (k = 0; k < 3; k++)
			{
				m += this.data[j*3+k] * matr[k*3+i];
			}

			temp[j*3+i] = m;
		}
	}

	for (i = 0; i < 9; i++) this.data[i] = temp[i];
	return this;
};


/**
**	Creates a translation matrix and appends it to the current matrix.
**
**	>> Matrix translate (float x, float y);
*/

Matrix.prototype.translate = function (x, y)
{
	if (x == 0 && y == 0)
		return this;

	return this.append ([1, 0, x, 0, 1, y, 0, 0, 1]);
};


/**
**	Creates a rotation matrix for the given angle (in radians) and appends it to the current matrix.
**
**	>> Matrix rotate (float angle);
*/

Matrix.prototype.rotate = function (angle)
{
	if (angle == 0)
		return this;

	return this.append ([Math.cos(angle), Math.sin(angle), 0, -Math.sin(angle), Math.cos(angle), 0, 0, 0, 1]);
};


/**
**	Creates a scale transformation matrix and appends it to the current matrix.
**
**	>> Matrix scale (float sx, float sy);
*/

Matrix.prototype.scale = function (sx, sy)
{
	if (sx == 1 && sy == 1)
		return this;

	return this.append ([sx, 0, 0, 0, sy, 0, 0, 0, 1]);
};


/**
**	Applies the matrix to a vector to transform it and returns a new vector.
**
**	>> Object{x,y} applyTo (float x, float y);
*/

Matrix.prototype.applyTo = function (x, y)
{
	var nx = this.data[0]*x + this.data[1]*y + this.data[2];
	var ny = this.data[3]*x + this.data[4]*y + this.data[5];

	return { x:nx, y:ny };
};


/**
**	Returns the transpose of the matrix as a new matrix.
**
**	>> Matrix transpose();
*/

Matrix.prototype.transpose = function ()
{
	var t = new Matrix ();

	for (var j = 0; j < 3; j++)
	for (var i = 0; i < 3; i++)
		t.data[j*3+i] = this.data[i*3+j];

	return t;
};

/**
**	Returns the determinant of the matrix.
**
**	>> float det();
*/

Matrix.prototype.det = function ()
{
	return	this.data[0] * (this.data[4]*this.data[8] - this.data[5]*this.data[7]) -
			this.data[1] * (this.data[3]*this.data[8] - this.data[5]*this.data[6]) +
			this.data[2] * (this.data[3]*this.data[7] - this.data[4]*this.data[6])
			;
};


/**
**	Returns the adjoint of the matrix as a new matrix.
**
**	>> Matrix adj();
*/

Matrix.prototype.adj = function ()
{
	var t = this.transpose();
	var d = [];

	d[0] = (t.data[4]*t.data[8] - t.data[5]*t.data[7]);
	d[1] = -(t.data[3]*t.data[8] - t.data[5]*t.data[6]);
	d[2] = (t.data[3]*t.data[7] - t.data[4]*t.data[6]);

	d[3] = -(t.data[1]*t.data[8] - t.data[2]*t.data[7]);
	d[4] = (t.data[0]*t.data[8] - t.data[2]*t.data[6]);
	d[5] = -(t.data[0]*t.data[7] - t.data[1]*t.data[6]);

	d[6] = (t.data[1]*t.data[5] - t.data[2]*t.data[4]);
	d[7] = -(t.data[0]*t.data[5] - t.data[2]*t.data[3]);
	d[8] = (t.data[0]*t.data[4] - t.data[1]*t.data[3]);

	t.data = d;
	return t;
};


/**
**	Returns the inverse of the matrix as a new matrix.
**
**	Matrix inverse();
*/

Matrix.prototype.inverse = function ()
{
	var det = this.det();
	if (!det) return null;

	return this.adj().scalef(1/det);
};
