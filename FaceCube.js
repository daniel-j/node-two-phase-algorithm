'use strict';

module.exports = FaceCube;

var Facelet = require('./Facelet.js');
var Color = require('./Color.js');
var Corner = require('./Corner.js');
var Edge = require('./Edge.js');
var CubieCube = require('./CubieCube.js');

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Cube on the facelet level

function FaceCube(cubeString) {
	var self = this;

	var f = self.f = new Array(54); // Type: Color

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Construct a facelet cube from a string
	var s = typeof cubeString === 'string' ? cubeString : "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";
	for (var i = 0; i < 54; i++)
		f[i] = Color.symbolOfStr(s.substring(i, i + 1));

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Gives string representation of a facelet cube
	function toString() {
		var s = "";
		for (var i = 0; i < 54; i++)
			s += f[i].toString();
		return s;
	}
	self.toString = toString;

	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	// Gives CubieCube representation of a faceletcube
	function toCubieCube() {
		var ori;
		var ccRet = new CubieCube();

		for (var i = 0; i < 8; i++)
			ccRet.cp[i] = Corner.URF;// invalidate corners
		for (var i = 0; i < 12; i++)
			ccRet.ep[i] = Edge.UR;// and edges
		var col1, col2;
		Corner.symbols().forEach(function (i) {
			// get the colors of the cubie at corner i, starting with U/D
			for (ori = 0; ori < 3; ori++)
				if (f[cornerFacelet[i.ordinal()][ori].ordinal()] === Color.U || f[cornerFacelet[i.ordinal()][ori].ordinal()] === Color.D)
					break;
			col1 = f[cornerFacelet[i.ordinal()][(ori + 1) % 3].ordinal()];
			col2 = f[cornerFacelet[i.ordinal()][(ori + 2) % 3].ordinal()];

			Corner.symbols().forEach(function (j) {
				if (col1 === cornerColor[j.ordinal()][1] && col2 === cornerColor[j.ordinal()][2]) {
					// in cornerposition i we have cornercubie j
					ccRet.cp[i.ordinal()] = j;
					ccRet.co[i.ordinal()] = ori % 3; // byte
					return;
				}
			});
		});
		Edge.symbols().forEach(function (i) {
			Edge.symbols().forEach(function (j) {

				if (f[edgeFacelet[i.ordinal()][0].ordinal()] === edgeColor[j.ordinal()][0]
						&& f[edgeFacelet[i.ordinal()][1].ordinal()] === edgeColor[j.ordinal()][1]) {
					ccRet.ep[i.ordinal()] = j;
					ccRet.eo[i.ordinal()] = 0;
					return;
				}
				
				if (f[edgeFacelet[i.ordinal()][0].ordinal()] === edgeColor[j.ordinal()][1]
						&& f[edgeFacelet[i.ordinal()][1].ordinal()] === edgeColor[j.ordinal()][0]) {
					ccRet.ep[i.ordinal()] = j;
					ccRet.eo[i.ordinal()] = 1;
					return;
				}
			});
		});

		return ccRet;
	};
	self.toCubieCube = toCubieCube;

}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Map the corner positions to facelet positions. cornerFacelet[URF.ordinal()][0] e.g. gives the position of the
// facelet in the URF corner position, which defines the orientation.<br>
// cornerFacelet[URF.ordinal()][1] and cornerFacelet[URF.ordinal()][2] give the position of the other two facelets
// of the URF corner (clockwise).
var cornerFacelet = [ [ Facelet.U9, Facelet.R1, Facelet.F3 ], [ Facelet.U7, Facelet.F1, Facelet.L3 ], [ Facelet.U1, Facelet.L1, Facelet.B3 ], [ Facelet.U3, Facelet.B1, Facelet.R3 ],
		[ Facelet.D3, Facelet.F9, Facelet.R7 ], [ Facelet.D1, Facelet.L9, Facelet.F7 ], [ Facelet.D7, Facelet.B9, Facelet.L7 ], [ Facelet.D9, Facelet.R9, Facelet.B7 ] ];
FaceCube.cornerFacelet = cornerFacelet;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Map the edge positions to facelet positions. edgeFacelet[UR.ordinal()][0] e.g. gives the position of the facelet in
// the UR edge position, which defines the orientation.<br>
// edgeFacelet[UR.ordinal()][1] gives the position of the other facelet
var edgeFacelet = [ [ Facelet.U6, Facelet.R2 ], [ Facelet.U8, Facelet.F2 ], [ Facelet.U4, Facelet.L2 ], [ Facelet.U2, Facelet.B2 ], [ Facelet.D6, Facelet.R8 ], [ Facelet.D2, Facelet.F8 ],
		[ Facelet.D4, Facelet.L8 ], [ Facelet.D8, Facelet.B8 ], [ Facelet.F6, Facelet.R4 ], [ Facelet.F4, Facelet.L6 ], [ Facelet.B6, Facelet.L4 ], [ Facelet.B4, Facelet.R6 ] ];
FaceCube.edgeFacelet = edgeFacelet;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Map the corner positions to facelet colors.
var cornerColor = [ [ Color.U, Color.R, Color.F ], [ Color.U, Color.F, Color.L ], [ Color.U, Color.L, Color.B ], [ Color.U, Color.B, Color.R ], [ Color.D, Color.F, Color.R ],
		[ Color.D, Color.L, Color.F ], [ Color.D, Color.B, Color.L ], [ Color.D, Color.R, Color.B ] ];
FaceCube.cornerColor = cornerColor;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Map the edge positions to facelet colors.
var edgeColor = [ [ Color.U, Color.R ], [ Color.U, Color.F ], [ Color.U, Color.L ], [ Color.U, Color.B ], [ Color.D, Color.R ], [ Color.D, Color.F ], [ Color.D, Color.L ], [ Color.D, Color.B ],
		[ Color.F, Color.R ], [ Color.F, Color.L ], [ Color.B, Color.L ], [ Color.B, Color.R ] ];
FaceCube.edgeColor = edgeColor;
