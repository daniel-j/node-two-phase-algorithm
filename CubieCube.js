'use strict';

module.exports = CubieCube;

var Corner = require('./Corner.js');
var Edge = require('./Edge.js');
var FaceCube = require('./FaceCube.js');


// ************************************** Moves on the cubie level ***************************************************

var cpU = [ Corner.UBR, Corner.URF, Corner.UFL, Corner.ULB, Corner.DFR, Corner.DLF, Corner.DBL, Corner.DRB ];
var coU = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0 ]);
var epU = [ Edge.UB, Edge.UR, Edge.UF, Edge.UL, Edge.DR, Edge.DF, Edge.DL, Edge.DB, Edge.FR, Edge.FL, Edge.BL, Edge.BR ];
var eoU = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);

var cpR = [ Corner.DFR, Corner.UFL, Corner.ULB, Corner.URF, Corner.DRB, Corner.DLF, Corner.DBL, Corner.UBR ];
var coR = new Uint8Array([ 2, 0, 0, 1, 1, 0, 0, 2 ]);
var epR = [ Edge.FR, Edge.UF, Edge.UL, Edge.UB, Edge.BR, Edge.DF, Edge.DL, Edge.DB, Edge.DR, Edge.FL, Edge.BL, Edge.UR ];
var eoR = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);

var cpF = [ Corner.UFL, Corner.DLF, Corner.ULB, Corner.UBR, Corner.URF, Corner.DFR, Corner.DBL, Corner.DRB ];
var coF = new Uint8Array([ 1, 2, 0, 0, 2, 1, 0, 0 ]);
var epF = [ Edge.UR, Edge.FL, Edge.UL, Edge.UB, Edge.DR, Edge.FR, Edge.DL, Edge.DB, Edge.UF, Edge.DF, Edge.BL, Edge.BR ];
var eoF = new Uint8Array([ 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0 ]);

var cpD = [ Corner.URF, Corner.UFL, Corner.ULB, Corner.UBR, Corner.DLF, Corner.DBL, Corner.DRB, Corner.DFR ];
var coD = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0 ]);
var epD = [ Edge.UR, Edge.UF, Edge.UL, Edge.UB, Edge.DF, Edge.DL, Edge.DB, Edge.DR, Edge.FR, Edge.FL, Edge.BL, Edge.BR ];
var eoD = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);

var cpL = [ Corner.URF, Corner.ULB, Corner.DBL, Corner.UBR, Corner.DFR, Corner.UFL, Corner.DLF, Corner.DRB ];
var coL = new Uint8Array([ 0, 1, 2, 0, 0, 2, 1, 0 ]);
var epL = [ Edge.UR, Edge.UF, Edge.BL, Edge.UB, Edge.DR, Edge.DF, Edge.FL, Edge.DB, Edge.FR, Edge.UL, Edge.DL, Edge.BR ];
var eoL = new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);

var cpB = [ Corner.URF, Corner.UFL, Corner.UBR, Corner.DRB, Corner.DFR, Corner.DLF, Corner.ULB, Corner.DBL ];
var coB = new Uint8Array([ 0, 0, 1, 2, 0, 0, 2, 1 ]);
var epB = [ Edge.UR, Edge.UF, Edge.UL, Edge.BR, Edge.DR, Edge.DF, Edge.DL, Edge.BL, Edge.FR, Edge.FL, Edge.UB, Edge.DB ];
var eoB = new Uint8Array([ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1 ]);


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Cube on the cubie level

function CubieCube(cp2, co2, ep2, eo2) {
	var self = this;

	// initialize to Id-Cube

	// corner permutation
	var cp = self.cp = cp2 || [ Corner.URF, Corner.UFL, Corner.ULB, Corner.UBR, Corner.DFR, Corner.DLF, Corner.DBL, Corner.DRB ];

	// corner orientation
	var co = self.co = co2 || new Uint8Array(8);

	// edge permutation
	var ep = self.ep = ep2 || [ Edge.UR, Edge.UF, Edge.UL, Edge.UB, Edge.DR, Edge.DF, Edge.DL, Edge.DB, Edge.FR, Edge.FL, Edge.BL, Edge.BR ];

	// edge orientation
	var eo = self.eo = eo2 || new Uint8Array(12);


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// return cube in facelet representation
	function toFaceCube() {
		var fcRet = new FaceCube();
		Corner.symbols().forEach(function (c) {
			var i = c.ordinal();
			var j = cp[i].ordinal();// cornercubie with index j is at
			// cornerposition with index i
			var ori = co[i];// Orientation of this cubie
			for (var n = 0; n < 3; n++)
				fcRet.f[FaceCube.cornerFacelet[i][(n + ori) % 3].ordinal()] = FaceCube.cornerColor[j][n];
		});
		Edge.symbols().forEach(function (e) {
			var i = e.ordinal();
			var j = ep[i].ordinal();// edgecubie with index j is at edgeposition
			// with index i
			var ori = eo[i];// Orientation of this cubie
			for (var n = 0; n < 2; n++)
				fcRet.f[FaceCube.edgeFacelet[i][(n + ori) % 2].ordinal()] = FaceCube.edgeColor[j][n];
		});
		return fcRet;
	}
	self.toFaceCube = toFaceCube;


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Multiply this CubieCube with another cubiecube b, restricted to the corners.<br>
	// Because we also describe reflections of the whole cube by permutations, we get a complication with the corners. The
	// orientations of mirrored corners are described by the numbers 3, 4 and 5. The composition of the orientations
	// cannot
	// be computed by addition modulo three in the cyclic group C3 any more. Instead the rules below give an addition in
	// the dihedral group D3 with 6 elements.<br>
	//	 
	// NOTE: Because we do not use symmetry reductions and hence no mirrored cubes in this simple implementation of the
	// Two-Phase-Algorithm, some code is not necessary here.
	//	
	function cornerMultiply(b) {
		var cPerm = new Array(8); // Type: Corner
		var cOri = new Uint8Array(8);
		Corner.symbols().forEach(function (corn) {
			cPerm[corn.ordinal()] = cp[b.cp[corn.ordinal()].ordinal()];

			var oriA = co[b.cp[corn.ordinal()].ordinal()];
			var oriB = b.co[corn.ordinal()];
			var ori = 0;
			
			if (oriA < 3 && oriB < 3) // if both cubes are regular cubes...
			{
				ori = oriA + oriB; // just do an addition modulo 3 here
				if (ori >= 3)
					ori -= 3; // the composition is a regular cube

				// +++++++++++++++++++++not used in this implementation +++++++++++++++++++++++++++++++++++
			} else if (oriA < 3 && oriB >= 3) // if cube b is in a mirrored
			// state...
			{
				ori = oriA + oriB;
				if (ori >= 6)
					ori -= 3; // the composition is a mirrored cube
			} else if (oriA >= 3 && oriB < 3) // if cube a is an a mirrored
			// state...
			{
				ori = oriA - oriB;
				if (ori < 3)
					ori += 3; // the composition is a mirrored cube
			} else if (oriA >= 3 && oriB >= 3) // if both cubes are in mirrored
			// states...
			{
				ori = oriA - oriB;
				if (ori < 0)
					ori += 3; // the composition is a regular cube
				// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
			}
			cOri[corn.ordinal()] = ori;
		});
		Corner.symbols().forEach(function (c) {
			cp[c.ordinal()] = cPerm[c.ordinal()];
			co[c.ordinal()] = cOri[c.ordinal()];
		});
	}
	self.cornerMultiply = cornerMultiply;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Multiply this CubieCube with another cubiecube b, restricted to the edges.
	function edgeMultiply(b) {
		var ePerm = new Array(12); // Type: Edge
		var eOri = new Uint8Array(12);
		Edge.symbols().forEach(function (edge) {
			ePerm[edge.ordinal()] = ep[b.ep[edge.ordinal()].ordinal()];
			eOri[edge.ordinal()] = ((b.eo[edge.ordinal()] + eo[b.ep[edge.ordinal()].ordinal()]) % 2);
		});
		Edge.symbols().forEach(function (e) {
			ep[e.ordinal()] = ePerm[e.ordinal()];
			eo[e.ordinal()] = eOri[e.ordinal()];
		});
	}
	self.edgeMultiply = edgeMultiply;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Multiply this CubieCube with another CubieCube b.
	function multiply(b) {
		cornerMultiply(b);
		// edgeMultiply(b);
	}
	self.multiply = multiply;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Compute the inverse CubieCube
	function invCubieCube(c) {
		Edge.symbols().forEach(function (edge) {
			c.ep[ep[edge.ordinal()].ordinal()] = edge;
		});
		Edge.symbols().forEach(function (edge) {
			c.eo[edge.ordinal()] = eo[c.ep[edge.ordinal()].ordinal()];
		});
		Corner.symbols().forEach(function (corn) {
			c.cp[cp[corn.ordinal()].ordinal()] = corn;
		});
		Corner.symbols().forEach(function (corn) {
			var ori = co[c.cp[corn.ordinal()].ordinal()];
			if (ori >= 3)// Just for completeness. We do not invert mirrored
				// cubes in the program.
				c.co[corn.ordinal()] = ori;
			else {// the standard case
				c.co[corn.ordinal()] = -ori;
				if (c.co[corn.ordinal()] < 0)
					c.co[corn.ordinal()] += 3;
			}
		});
	}
	self.invCubieCube = invCubieCube;

	// ********************************************* Get and set coordinates *********************************************

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// return the twist of the 8 corners. 0 <= twist < 3^7
	function getTwist() {
		var ret = 0;
		for (var i = Corner.URF.ordinal(); i < Corner.DRB.ordinal(); i++) // Derp. this loop will always loop 8 times?
			ret = (3 * ret + co[i]);
		return ret;
	}
	self.getTwist = getTwist;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function setTwist(twist) {
		var twistParity = 0;
		for (var i = Corner.DRB.ordinal() - 1; i >= Corner.URF.ordinal(); i--) {
			twistParity += co[i] = (twist % 3); // Right... assignment, then increment?
			twist = ~~(twist / 3);
		}
		co[Corner.DRB.ordinal()] = ((3 - twistParity % 3) % 3);
	}
	self.setTwist = setTwist;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// return the flip of the 12 edges. 0<= flip < 2^11
	function getFlip() {
		var ret = 0;
		for (var i = Edge.UR.ordinal(); i < Edge.BR.ordinal(); i++)
			ret = (2 * ret + eo[i]);
		return ret;
	}
	self.getFlip = getFlip;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function setFlip(flip) {
		var flipParity = 0;
		for (var i = Edge.BR.ordinal() - 1; i >= Edge.UR.ordinal(); i--) {
			flipParity += eo[i] = (flip % 2);
			flip = ~~(flip / 2);
		}
		eo[Edge.BR.ordinal()] = ((2 - flipParity % 2) % 2);
	}
	self.setFlip = setFlip;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Parity of the corner permutation
	function cornerParity() {
		var s = 0;
		for (var i = Corner.DRB.ordinal(); i >= Corner.URF.ordinal() + 1; i--)
			for (var j = i - 1; j >= Corner.URF.ordinal(); j--)
				if (cp[j].ordinal() > cp[i].ordinal())
					s++;
		return (s % 2);
	}
	self.cornerParity = cornerParity;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Parity of the edges permutation. Parity of corners and edges are the same if the cube is solvable.
	function edgeParity() {
		var s = 0;
		for (var i = Edge.BR.ordinal(); i >= Edge.UR.ordinal() + 1; i--)
			for (var j = i - 1; j >= Edge.UR.ordinal(); j--)
				if (ep[j].ordinal() > ep[i].ordinal())
					s++;
		return (s % 2);
	}
	self.edgeParity = edgeParity;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// permutation of the UD-slice edges FR,FL,BL and BR
	function getFRtoBR() {
		var a = 0, x = 0;
		var edge4 = new Array(4); // Type: Edge
		// compute the index a < (12 choose 4) and the permutation array perm.
		for (var j = Edge.BR.ordinal(); j >= Edge.UR.ordinal(); j--)
			if (Edge.FR.ordinal() <= ep[j].ordinal() && ep[j].ordinal() <= Edge.BR.ordinal()) {
				a += Cnk(11 - j, x + 1);
				edge4[3 - x++] = ep[j];
			}

		var b = 0;
		for (var j = 3; j > 0; j--)// compute the index b < 4! for the
		// permutation in perm
		{
			var k = 0;
			while (edge4[j].ordinal() !== j + 8) {
				rotateLeft(edge4, 0, j);
				k++;
			}
			b = (j + 1) * b + k;
		}
		return (24 * a + b);
	}
	self.getFRtoBR = getFRtoBR;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function setFRtoBR(idx) {
		var x;
		var sliceEdge = [ Edge.FR, Edge.FL, Edge.BL, Edge.BR ];
		var otherEdge = [ Edge.UR, Edge.UF, Edge.UL, Edge.UB, Edge.DR, Edge.DF, Edge.DL, Edge.DB ];
		var b = idx % 24; // Permutation
		var a = ~~(idx / 24); // Combination
		Edge.symbols().forEach(function (e) {
			ep[e.ordinal()] = Edge.DB;// Use UR to invalidate all edges
		});

		for (var j = 1, k; j < 4; j++)// generate permutation from index b
		{
			k = b % (j + 1);
			b = ~~(b / (j + 1));
			while (k-- > 0)
				rotateRight(sliceEdge, 0, j);
		}

		x = 3;// generate combination and set slice edges
		for (var j = Edge.UR.ordinal(); j <= Edge.BR.ordinal(); j++)
			if (a - Cnk(11 - j, x + 1) >= 0) {
				ep[j] = sliceEdge[3 - x];
				a -= Cnk(11 - j, x-- + 1);
			}
		x = 0; // set the remaining edges UR..DB
		for (var j = Edge.UR.ordinal(); j <= Edge.BR.ordinal(); j++)
			if (ep[j] === Edge.DB)
				ep[j] = otherEdge[x++];

	}
	self.setFRtoBR = setFRtoBR;


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Permutation of all corners except DBL and DRB
	function getURFtoDLF() {
		var a = 0, x = 0;
		var corner6 = new Array(6); // Type: Corner
		// compute the index a < (8 choose 6) and the corner permutation.
		for (var j = Corner.URF.ordinal(); j <= Corner.DRB.ordinal(); j++)
			if (cp[j].ordinal() <= Corner.DLF.ordinal()) {
				a += Cnk(j, x + 1);
				corner6[x++] = cp[j];
			}

		var b = 0;
		for (var j = 5; j > 0; j--)// compute the index b < 6! for the
		// permutation in corner6
		{
			var k = 0;
			while (corner6[j].ordinal() !== j) {
				rotateLeft(corner6, 0, j);
				k++;
			}
			b = (j + 1) * b + k;
		}
		return (720 * a + b);
	}
	self.getURFtoDLF = getURFtoDLF;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function setURFtoDLF(idx) {
		var x;
		var corner6 = [ Corner.URF, Corner.UFL, Corner.ULB, Corner.UBR, Corner.DFR, Corner.DLF ];
		var otherCorner = [ Corner.DBL, Corner.DRB ];
		var b = idx % 720; // Permutation
		var a = ~~(idx / 720); // Combination
		Corner.symbols().forEach(function (c) {
			cp[c.ordinal()] = Corner.DRB;// Use DRB to invalidate all corners
		});

		for (var j = 1, k; j < 6; j++)// generate permutation from index b
		{
			k = b % (j + 1);
			b = ~~(b / (j + 1));
			while (k-- > 0)
				rotateRight(corner6, 0, j);
		}
		x = 5;// generate combination and set corners
		for (var j = Corner.DRB.ordinal(); j >= 0; j--)
			if (a - Cnk(j, x + 1) >= 0) {
				cp[j] = corner6[x];
				a -= Cnk(j, x-- + 1);
			}
		x = 0;
		for (var j = Corner.URF.ordinal(); j <= Corner.DRB.ordinal(); j++)
			if (cp[j] === Corner.DRB)
				cp[j] = otherCorner[x++];
	}
	self.setURFtoDLF = setURFtoDLF;


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Permutation of the six edges UR,UF,UL,UB,DR,DF.
	function getURtoDF() {
		var a = 0, x = 0;
		var edge6 = new Array(6); // Type: Edge
		// compute the index a < (12 choose 6) and the edge permutation.
		for (var j = Edge.UR.ordinal(); j <= Edge.BR.ordinal(); j++)
			if (ep[j].ordinal() <= Edge.DF.ordinal()) {
				a += Cnk(j, x + 1);
				edge6[x++] = ep[j];
			}

		var b = 0;
		for (var j = 5; j > 0; j--)// compute the index b < 6! for the
		// permutation in edge6
		{
			var k = 0;
			while (edge6[j].ordinal() !== j) {
				rotateLeft(edge6, 0, j);
				k++;
			}
			b = (j + 1) * b + k;
		}
		return 720 * a + b;
	}
	self.getURtoDF = getURtoDF;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function setURtoDF(idx) {
		var x;
		var edge6 = [ Edge.UR, Edge.UF, Edge.UL, Edge.UB, Edge.DR, Edge.DF ];
		var otherEdge = [ Edge.DL, Edge.DB, Edge.FR, Edge.FL, Edge.BL, Edge.BR ];
		var b = idx % 720; // Permutation
		var a = ~~(idx / 720); // Combination
		Edge.symbols().forEach(function (e) {
			ep[e.ordinal()] = Edge.BR;// Use BR to invalidate all edges
		});

		for (var j = 1, k; j < 6; j++)// generate permutation from index b
		{
			k = b % (j + 1);
			b = ~~(b / (j + 1));
			while (k-- > 0)
				rotateRight(edge6, 0, j);
		}
		x = 5;// generate combination and set edges
		for (var j = Edge.BR.ordinal(); j >= 0; j--)
			if (a - Cnk(j, x + 1) >= 0) {
				ep[j] = edge6[x];
				a -= Cnk(j, x-- + 1);
			}
		x = 0; // set the remaining edges DL..BR
		for (var j = Edge.UR.ordinal(); j <= Edge.BR.ordinal(); j++)
			if (ep[j] === Edge.BR)
				ep[j] = otherEdge[x++];
	}
	self.setURtoDF = setURtoDF;


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Permutation of the three edges UR,UF,UL
	function getURtoUL() {
		var a = 0, x = 0;
		var edge3 = new Array(3); // Type: Edge
		// compute the index a < (12 choose 3) and the edge permutation.
		for (var j = Edge.UR.ordinal(); j <= Edge.BR.ordinal(); j++)
			if (ep[j].ordinal() <= Edge.UL.ordinal()) {
				a += Cnk(j, x + 1);
				edge3[x++] = ep[j];
			}

		var b = 0;
		for (var j = 2; j > 0; j--)// compute the index b < 3! for the
		// permutation in edge3
		{
			var k = 0;
			while (edge3[j].ordinal() !== j) {
				rotateLeft(edge3, 0, j);
				k++;
			}
			b = (j + 1) * b + k;
		}
		return (6 * a + b);
	}
	self.getURtoUL = getURtoUL;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function setURtoUL(idx) {
		var x;
		var edge3 = [ Edge.UR, Edge.UF, Edge.UL ];
		var b = idx % 6; // Permutation
		var a = ~~(idx / 6); // Combination
		Edge.symbols().forEach(function (e) {
			ep[e.ordinal()] = Edge.BR;// Use BR to invalidate all edges
		});

		for (var j = 1, k; j < 3; j++)// generate permutation from index b
		{
			k = b % (j + 1);
			b = ~~(b / (j + 1));
			while (k-- > 0)
				rotateRight(edge3, 0, j);
		}
		x = 2;// generate combination and set edges
		for (var j = Edge.BR.ordinal(); j >= 0; j--)
			if (a - Cnk(j, x + 1) >= 0) {
				ep[j] = edge3[x];
				a -= Cnk(j, x-- + 1);
			}
	}
	self.setURtoUL = setURtoUL;


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Permutation of the three edges UB,DR,DF
	function getUBtoDF() {
		var a = 0, x = 0;
		var edge3 = new Array(3); // Type: Edge
		// compute the index a < (12 choose 3) and the edge permutation.
		for (var j = Edge.UR.ordinal(); j <= Edge.BR.ordinal(); j++)
			if (Edge.UB.ordinal() <= ep[j].ordinal() && ep[j].ordinal() <= Edge.DF.ordinal()) {
				a += Cnk(j, x + 1);
				edge3[x++] = ep[j];
			}

		var b = 0;
		for (var j = 2; j > 0; j--)// compute the index b < 3! for the
		// permutation in edge3
		{
			var k = 0;
			while (edge3[j].ordinal() !== Edge.UB.ordinal() + j) {
				rotateLeft(edge3, 0, j);
				k++;
			}
			b = (j + 1) * b + k;
		}
		return (6 * a + b);
	}
	self.getUBtoDF = getUBtoDF;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function setUBtoDF(idx) {
		var x;
		var edge3 = [ Edge.UB, Edge.DR, Edge.DF ];
		var b = idx % 6; // Permutation
		var a = ~~(idx / 6); // Combination
		Edge.symbols().forEach(function (e) {
			ep[e.ordinal()] = Edge.BR;// Use BR to invalidate all edges
		});

		for (var j = 1, k; j < 3; j++)// generate permutation from index b
		{
			k = b % (j + 1);
			b = ~~(b / (j + 1));
			while (k-- > 0)
				rotateRight(edge3, 0, j);
		}
		x = 2;// generate combination and set edges
		for (var j = Edge.BR.ordinal(); j >= 0; j--)
			if (a - Cnk(j, x + 1) >= 0) {
				ep[j] = edge3[x];
				a -= Cnk(j, x-- + 1);
			}
	}
	self.setUBtoDF = setUBtoDF;


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function getURFtoDLB() {
		var perm = new Array(8); // Type: Corner
		var b = 0;
		for (var i = 0; i < 8; i++)
			perm[i] = cp[i];
		for (var j = 7; j > 0; j--)// compute the index b < 8! for the permutation in perm
		{
			var k = 0;
			while (perm[j].ordinal() !== j) {
				rotateLeft(perm, 0, j);
				k++;
			}
			b = (j + 1) * b + k;
		}
		return b;
	}
	self.getURFtoDLB = getURFtoDLB;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function setURFtoDLB(idx) {
		var perm = [ Corner.URF, Corner.UFL, Corner.ULB, Corner.UBR, Corner.DFR, Corner.DLF, Corner.DBL, Corner.DRB ];
		var k;
		for (var j = 1; j < 8; j++) {
			k = idx % (j + 1);
			idx = ~~(idx / (j + 1));
			while (k-- > 0)
				rotateRight(perm, 0, j);
		}
		var x = 7;// set corners
		for (var j = 7; j >= 0; j--)
			cp[j] = perm[x--];
	}
	self.setURFtoDLB = setURFtoDLB;


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function getURtoBR() {
		var perm = new Array(12); // Type: Edge
		var b = 0;
		for (var i = 0; i < 12; i++)
			perm[i] = ep[i];
		for (var j = 11; j > 0; j--)// compute the index b < 12! for the permutation in perm
		{
			var k = 0;
			while (perm[j].ordinal() !== j) {
				rotateLeft(perm, 0, j);
				k++;
			}
			b = (j + 1) * b + k;
		}
		return b;
	}
	self.getURtoBR = getURtoBR;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function setURtoBR(idx) {
		var perm = [ Edge.UR, Edge.UF, Edge.UL, Edge.UB, Edge.DR, Edge.DF, Edge.DL, Edge.DB, Edge.FR, Edge.FL, Edge.BL, Edge.BR ];
		var k;
		for (var j = 1; j < 12; j++) {
			k = idx % (j + 1);
			idx = ~~(idx / (j + 1));
			while (k-- > 0)
				rotateRight(perm, 0, j);
		}
		var x = 11;// set edges
		for (var j = 11; j >= 0; j--)
			ep[j] = perm[x--];
	}
	self.setURtoBR = setURtoBR;


	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Check a cubiecube for solvability. Return the error code.
	// 0: Cube is solvable
	// -2: Not all 12 edges exist exactly once
	// -3: Flip error: One edge has to be flipped
	// -4: Not all corners exist exactly once
	// -5: Twist error: One corner has to be twisted
	// -6: Parity error: Two corners or two edges have to be exchanged
	function verify() {
		var sum = 0;
		var edgeCount = new Int32Array(12);

		Edge.symbols().forEach(function (e) {
			edgeCount[ep[e.ordinal()].ordinal()]++;
		});
		
		for (var i = 0; i < 12; i++)
			if (edgeCount[i] !== 1)
				return -2;// missing edges

		for (var i = 0; i < 12; i++)
			sum += eo[i];
		if (sum % 2 !== 0)
			return -3;// flip error

		var cornerCount = new Int32Array(8);
		Corner.symbols().forEach(function (c) {
			cornerCount[cp[c.ordinal()].ordinal()]++;
		});
		for (var i = 0; i < 8; i++)
			if (cornerCount[i] !== 1)
				return -4;// missing corners

		sum = 0;
		for (var i = 0; i < 8; i++)
			sum += co[i];
		if (sum % 3 !== 0)
			return -5;// twisted corner

		if ((edgeParity() ^ cornerParity()) !== 0)
			return -6;// parity error

		return 0;// cube ok
	}
	self.verify = verify;

}

// this CubieCube array represents the 6 basic cube moves
var moveCube = CubieCube.moveCube = new Array(6); // Type: CubieCube

moveCube[0] = new CubieCube();
moveCube[0].cp = cpU;
moveCube[0].co = coU;
moveCube[0].ep = epU;
moveCube[0].eo = eoU;

moveCube[1] = new CubieCube();
moveCube[1].cp = cpR;
moveCube[1].co = coR;
moveCube[1].ep = epR;
moveCube[1].eo = eoR;

moveCube[2] = new CubieCube();
moveCube[2].cp = cpF;
moveCube[2].co = coF;
moveCube[2].ep = epF;
moveCube[2].eo = eoF;

moveCube[3] = new CubieCube();
moveCube[3].cp = cpD;
moveCube[3].co = coD;
moveCube[3].ep = epD;
moveCube[3].eo = eoD;

moveCube[4] = new CubieCube();
moveCube[4].cp = cpL;
moveCube[4].co = coL;
moveCube[4].ep = epL;
moveCube[4].eo = eoL;

moveCube[5] = new CubieCube();
moveCube[5].cp = cpB;
moveCube[5].co = coB;
moveCube[5].ep = epB;
moveCube[5].eo = eoB;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// n choose k
function Cnk(n, k) {
	var i, j, s;
	if (n < k)
		return 0;
	if (k > ~~(n / 2))
		k = n - k;
	for (s = 1, i = n, j = 1; i !== n - k; i--, j++) {
		s *= i;
		s = ~~(s / j);
	}
	return s;
}
CubieCube.Cnk = Cnk;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Left rotation of all array elements between l and r
function rotateLeft(arr, l, r) {
	var temp = arr[l];
	for (var i = l; i < r; i++)
		arr[i] = arr[i + 1];
	arr[r] = temp;
}
CubieCube.rotateLeft = rotateLeft;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Right rotation of all array elements between l and r
function rotateRight(arr, l, r) {
	var temp = arr[r];
	for (var i = r; i > l; i--)
		arr[i] = arr[i - 1];
	arr[l] = temp;
}
CubieCube.rotateRight = rotateRight;


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Permutation of the six edges UR,UF,UL,UB,DR,DF
function getURtoDF(idx1, idx2) {
	var a = new CubieCube();
	var b = new CubieCube();
	a.setURtoUL(idx1);
	b.setUBtoDF(idx2);
	for (var i = 0; i < 8; i++) {
		if (a.ep[i] !== Edge.BR)
			if (b.ep[i] !== Edge.BR)// collision
				return -1;
			else
				b.ep[i] = a.ep[i];
	}
	return b.getURtoDF();
}
CubieCube.getURtoDF = getURtoDF;

