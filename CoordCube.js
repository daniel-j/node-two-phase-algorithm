'use strict';

module.exports = CoordCubie;

var fs = require('fs');
var CubieCube = require('./CubieCube.js');
var path = require('path');

var tableDir = path.join(__dirname, 'tables/');

function CoordCubie(c) {
	var self = this;

	// All coordinates are 0 for a solved cube except for UBtoDF, which is 114
	var twist = self.twist = c.getTwist();
	var flip = self.flip = c.getFlip();
	var parity = self.parity = c.cornerParity();
	var FRtoBR = self.FRtoBR = c.getFRtoBR();
	var URFtoDLF = self.URFtoDLF = c.getURFtoDLF();
	var URtoUL = self.URtoUL = c.getURtoUL();
	var UBtoDF = self.UBtoDF = c.getUBtoDF();
	var URtoDF = self.URtoDF = c.getURtoDF();// only needed in phase2


	// A move on the coordinate level
	// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	function move(m) {
		twist = self.twist = twistMove[twist][m];
		flip = self.flip = flipMove[flip][m];
		parity = self.parity = parityMove[parity][m];
		FRtoBR = self.FRtoBR = FRtoBR_Move[FRtoBR][m];
		URFtoDLF = self.URFtoDLF = URFtoDLF_Move[URFtoDLF][m];
		URtoUL = self.URtoUL = URtoUL_Move[URtoUL][m];
		UBtoDF = self.UBtoDF = UBtoDF_Move[UBtoDF][m];
		if (URtoUL < 336 && UBtoDF < 336)// updated only if UR,UF,UL,UB,DR,DF
			// are not in UD-slice
			URtoDF = self.URtoDF = MergeURtoULandUBtoDF[URtoUL][UBtoDF];
	}
	self.move = move;

}

var N_TWIST = CoordCubie.N_TWIST = 2187;// 3^7 possible corner orientations
var N_FLIP = CoordCubie.N_FLIP = 2048;// 2^11 possible edge flips
var N_SLICE1 = CoordCubie.N_SLICE1 = 495;// 12 choose 4 possible positions of FR,FL,BL,BR edges
var N_SLICE2 = CoordCubie.N_SLICE2 = 24;// 4! permutations of FR,FL,BL,BR edges in phase2
var N_PARITY = CoordCubie.N_PARITY = 2; // 2 possible corner parities
var N_URFtoDLF = CoordCubie.N_URFtoDLF = 20160;// 8!/(8-6)! permutation of URF,UFL,ULB,UBR,DFR,DLF corners
var N_FRtoBR = CoordCubie.N_FRtoBR = 11880; // 12!/(12-4)! permutation of FR,FL,BL,BR edges
var N_URtoUL = CoordCubie.N_URtoUL = 1320; // 12!/(12-3)! permutation of UR,UF,UL edges
var N_UBtoDF = CoordCubie.N_UBtoDF = 1320; // 12!/(12-3)! permutation of UB,DR,DF edges
var N_URtoDF = CoordCubie.N_URtoDF = 20160; // 8!/(8-6)! permutation of UR,UF,UL,UB,DR,DF edges in phase2

var N_URFtoDLB = CoordCubie.N_URFtoDLB = 40320;// 8! permutations of the corners
var N_URtoBR = CoordCubie.N_URtoBR = 479001600;// 8! permutations of the corners

var N_MOVE = CoordCubie.N_MOVE = 18;

console.log("Generating/loading tables...");

// ******************************************Phase 1 move tables*****************************************************


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Move table for the twists of the corners
// twist < 2187 in phase 2.
// twist = 0 in phase 2.
//static short[][] twistMove = new short[N_TWIST][N_MOVE];
var twistMove = CoordCubie.twistMove = [];
(function () {
	
	var filename = path.join(tableDir, "twistMove.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading twistMove...");
		var data = fs.readFileSync(filename);
		for (var i = 0; i < N_TWIST; i++) {
			twistMove[i] = new Int16Array(N_MOVE);
			for (var j = 0; j < N_MOVE; j++) {
				twistMove[i][j] = data.readInt16LE((i*N_MOVE+j)*2);
			}
		}

	} else {
		console.log("Generating twistMove...");
		for (var i = 0; i < N_TWIST; i++) {
			twistMove[i] = new Int16Array(N_MOVE); // short
		}
		var a = new CubieCube();
		for (var i = 0; i < N_TWIST; i++) {
			a.setTwist(i);
			for (var j = 0; j < 6; j++) {
				for (var k = 0; k < 3; k++) {
					a.cornerMultiply(CubieCube.moveCube[j]);
					twistMove[i][3 * j + k] = a.getTwist();
				}
				a.cornerMultiply(CubieCube.moveCube[j]);// 4. faceturn restores
				// a
			}
		}
		var data = new Buffer(N_TWIST*N_MOVE*2);
		for (var i = 0; i < N_TWIST; i++) {
			for (var j = 0; j < N_MOVE; j++) {
				data.writeInt16LE(twistMove[i][j], (i*N_MOVE+j)*2);
			}
		}
		fs.writeFileSync(filename, data);
	}
	
}());

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Move table for the flips of the edges
// flip < 2048 in phase 1
// flip = 0 in phase 2.
//static short[][] flipMove = new short[N_FLIP][N_MOVE];
var flipMove = CoordCubie.flipMove = [];
(function () {
	var filename = path.join(tableDir, "flipMove.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading flipMove...");
		var data = fs.readFileSync(filename);
		for (var i = 0; i < N_FLIP; i++) {
			flipMove[i] = new Int16Array(N_MOVE);
			for (var j = 0; j < N_MOVE; j++) {
				flipMove[i][j] = data.readInt16LE((i*N_MOVE+j)*2);
			}
		}
	} else {
		console.log("Generating flipMove...");
		for (var i = 0; i < N_FLIP; i++) {
			flipMove[i] = new Int16Array(N_MOVE); // short
		}

		var a = new CubieCube();
		for (var i = 0; i < N_FLIP; i++) {
			a.setFlip(i);
			for (var j = 0; j < 6; j++) {
				for (var k = 0; k < 3; k++) {
					a.edgeMultiply(CubieCube.moveCube[j]);
					flipMove[i][3 * j + k] = a.getFlip();
				}
				a.edgeMultiply(CubieCube.moveCube[j]);
				// a
			}
		}
		var data = new Buffer(N_FLIP*N_MOVE*2);
		for (var i = 0; i < N_FLIP; i++) {
			for (var j = 0; j < N_MOVE; j++) {
				data.writeInt16LE(flipMove[i][j], (i*N_MOVE+j)*2);
			}
		}
		/*var data = "";
		for (var i = 0; i < N_FLIP; i++) {
			data += new Buffer(new Uint8Array(flipMove[i].buffer)).toString('binary');
		}*/
		fs.writeFileSync(filename, data);
	}
}());

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Parity of the corner permutation. This is the same as the parity for the edge permutation of a valid cube.
// parity has values 0 and 1
var parityMove = CoordCubie.parityMove = [ new Int16Array([ 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1 ]),
		new Int16Array([ 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0 ]) ];


// ***********************************Phase 1 and 2 movetable********************************************************

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Move table for the four UD-slice edges FR, FL, Bl and BR
// FRtoBRMove < 11880 in phase 1
// FRtoBRMove < 24 in phase 2
// FRtoBRMove = 0 for solved cube
//static short[][] FRtoBR_Move = new short[N_FRtoBR][N_MOVE];
var FRtoBR_Move = CoordCubie.FRtoBR_Move = [];
(function () {
	var filename = path.join(tableDir, "FRtoBR_Move.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading FRtoBR_Move...");
		var data = fs.readFileSync(filename);
		for (var i = 0; i < N_FRtoBR; i++) {
			FRtoBR_Move[i] = new Int16Array(N_MOVE);
			for (var j = 0; j < N_MOVE; j++) {
				FRtoBR_Move[i][j] = data.readInt16LE((i*N_MOVE+j)*2);
			}
		}
		/*for (var i = 0; i < N_FRtoBR; i++) {
			FRtoBR_Move[i] = new Int16Array(data.slice(i*N_MOVE*2, i*N_MOVE*2+N_MOVE*2));
		}*/
	} else {
		console.log("Generating FRtoBR_Move...");
		for (var i = 0; i < N_FRtoBR; i++) {
			FRtoBR_Move[i] = new Int16Array(N_MOVE); // short
		}

		var a = new CubieCube();
		for (var i = 0; i < N_FRtoBR; i++) {
			a.setFRtoBR(i);
			for (var j = 0; j < 6; j++) {
				for (var k = 0; k < 3; k++) {
					a.edgeMultiply(CubieCube.moveCube[j]);
					FRtoBR_Move[i][3 * j + k] = a.getFRtoBR();
				}
				a.edgeMultiply(CubieCube.moveCube[j]);
			}
		}
		var data = new Buffer(N_FRtoBR*N_MOVE*2);
		for (var i = 0; i < N_FRtoBR; i++) {
			for (var j = 0; j < N_MOVE; j++) {
				data.writeInt16LE(FRtoBR_Move[i][j], (i*N_MOVE+j)*2);
			}
		}
		/*var data = "";
		for (var i = 0; i < N_FRtoBR; i++) {
			data += new Buffer(new Uint8Array(FRtoBR_Move[i].buffer)).toString('binary');
		}*/
		fs.writeFileSync(filename, data);
	}
}());

// *******************************************Phase 1 and 2 movetable************************************************

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Move table for permutation of six corners. The positions of the DBL and DRB corners are determined by the parity.
// URFtoDLF < 20160 in phase 1
// URFtoDLF < 20160 in phase 2
// URFtoDLF = 0 for solved cube.
//static short[][] URFtoDLF_Move = new short[N_URFtoDLF][N_MOVE];
var URFtoDLF_Move = CoordCubie.URFtoDLF_Move = [];
(function () {
	var filename = path.join(tableDir, "URFtoDLF_Move.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading URFtoDLF_Move...");
		var data = fs.readFileSync(filename);
		for (var i = 0; i < N_URFtoDLF; i++) {
			URFtoDLF_Move[i] = new Int16Array(data.slice(i*N_MOVE*2, i*N_MOVE*2+N_MOVE*2));
		}
	} else {
		console.log("Generating URFtoDLF_Move...");
		for (var i = 0; i < N_URFtoDLF; i++) {
			URFtoDLF_Move[i] = new Int16Array(N_MOVE); // short
		}

		var a = new CubieCube();
		for (var i = 0; i < N_URFtoDLF; i++) {
			a.setURFtoDLF(i);
			for (var j = 0; j < 6; j++) {
				for (var k = 0; k < 3; k++) {
					a.cornerMultiply(CubieCube.moveCube[j]);
					URFtoDLF_Move[i][3 * j + k] = a.getURFtoDLF();
				}
				a.cornerMultiply(CubieCube.moveCube[j]);
			}
		}
		var data = "";
		for (var i = 0; i < N_URFtoDLF; i++) {
			data += new Buffer(new Uint8Array(URFtoDLF_Move[i].buffer)).toString('binary');
		}
		fs.writeFileSync(filename, data, 'binary');
	}
}());

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Move table for the permutation of six U-face and D-face edges in phase2. The positions of the DL and DB edges are
// determined by the parity.
// URtoDF < 665280 in phase 1
// URtoDF < 20160 in phase 2
// URtoDF = 0 for solved cube.
//static short[][] URtoDF_Move = new short[N_URtoDF][N_MOVE];
var URtoDF_Move = CoordCubie.URtoDF_Move = [];
(function () {
	var filename = path.join(tableDir, "URtoDF_Move.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading URtoDF_Move...");
		var data = fs.readFileSync(filename);
		for (var i = 0; i < N_URtoDF; i++) {
			URtoDF_Move[i] = new Int16Array(data.slice(i*N_MOVE*2, i*N_MOVE*2+N_MOVE*2));
		}
	} else {
		console.log("Generating URtoDF_Move...");
		for (var i = 0; i < N_URtoDF; i++) {
			URtoDF_Move[i] = new Int16Array(N_MOVE); // short
		}

		var a = new CubieCube();
		for (var i = 0; i < N_URtoDF; i++) {
			a.setURtoDF(i);
			for (var j = 0; j < 6; j++) {
				for (var k = 0; k < 3; k++) {
					a.edgeMultiply(CubieCube.moveCube[j]);
					URtoDF_Move[i][3 * j + k] = a.getURtoDF();
					// Table values are only valid for phase 2 moves!
					// For phase 1 moves, casting to short is not possible.
				}
				a.edgeMultiply(CubieCube.moveCube[j]);
			}
		}
		var data = "";
		for (var i = 0; i < N_URtoDF; i++) {
			data += new Buffer(new Uint8Array(URtoDF_Move[i].buffer)).toString('binary');
		}
		fs.writeFileSync(filename, data, 'binary');
	}
}());

// **************************helper move tables to compute URtoDF for the beginning of phase2************************

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Move table for the three edges UR,UF and UL in phase1.
//static short[][] URtoUL_Move = new short[N_URtoUL][N_MOVE];
var URtoUL_Move = CoordCubie.URtoUL_Move = [];
(function () {
	var filename = path.join(tableDir, "URtoUL_Move.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading URtoUL_Move...");
		var data = fs.readFileSync(filename);
		for (var i = 0; i < N_URtoUL; i++) {
			URtoUL_Move[i] = new Int16Array(data.slice(i*N_MOVE*2, i*N_MOVE*2+N_MOVE*2));
		}
	} else {
		console.log("Generating URtoUL_Move...");
		for (var i = 0; i < N_URtoUL; i++) {
			URtoUL_Move[i] = new Int16Array(N_MOVE); // short
		}

		var a = new CubieCube();
		for (var i = 0; i < N_URtoUL; i++) {
			a.setURtoUL(i);
			for (var j = 0; j < 6; j++) {
				for (var k = 0; k < 3; k++) {
					a.edgeMultiply(CubieCube.moveCube[j]);
					URtoUL_Move[i][3 * j + k] = a.getURtoUL();
				}
				a.edgeMultiply(CubieCube.moveCube[j]);
			}
		}
		var data = "";
		for (var i = 0; i < N_URtoUL; i++) {
			data += new Buffer(new Uint8Array(URtoUL_Move[i].buffer)).toString('binary');
		}
		fs.writeFileSync(filename, data, 'binary');
	}
}());

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Move table for the three edges UB,DR and DF in phase1.
//static short[][] UBtoDF_Move = new short[N_UBtoDF][N_MOVE];
var UBtoDF_Move = CoordCubie.UBtoDF_Move = [];
(function () {
	var filename = path.join(tableDir, "UBtoDF_Move.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading UBtoDF_Move...");
		var data = fs.readFileSync(filename);
		for (var i = 0; i < N_UBtoDF; i++) {
			UBtoDF_Move[i] = new Int16Array(data.slice(i*N_MOVE*2, i*N_MOVE*2+N_MOVE*2));
		}
	} else {
		console.log("Generating UBtoDF_Move...");
		for (var i = 0; i < N_UBtoDF; i++) {
			UBtoDF_Move[i] = new Int16Array(N_MOVE); // short
		}

		var a = new CubieCube();
		for (var i = 0; i < N_UBtoDF; i++) {
			a.setUBtoDF(i);
			for (var j = 0; j < 6; j++) {
				for (var k = 0; k < 3; k++) {
					a.edgeMultiply(CubieCube.moveCube[j]);
					UBtoDF_Move[i][3 * j + k] = a.getUBtoDF();
				}
				a.edgeMultiply(CubieCube.moveCube[j]);
			}
		}
		var data = "";
		for (var i = 0; i < N_UBtoDF; i++) {
			data += new Buffer(new Uint8Array(UBtoDF_Move[i].buffer)).toString('binary');
		}
		fs.writeFileSync(filename, data, 'binary');
	}
}());

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Table to merge the coordinates of the UR,UF,UL and UB,DR,DF edges at the beginning of phase2
//static short[][] MergeURtoULandUBtoDF = new short[336][336];
var MergeURtoULandUBtoDF = CoordCubie.MergeURtoULandUBtoDF = [];
(function () {
	var filename = path.join(tableDir, "MergeURtoULandUBtoDF.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading MergeURtoULandUBtoDF...");
		var data = fs.readFileSync(filename);
		for (var i = 0; i < 336; i++) {
			MergeURtoULandUBtoDF[i] = new Int16Array(data.slice(i*336*2, i*336*2+336*2));
		}
	} else {
		console.log("Generating MergeURtoULandUBtoDF...");
		for (var i = 0; i < 336; i++) {
			MergeURtoULandUBtoDF[i] = new Int16Array(336); // short
		}

		// for i, j <336 the six edges UR,UF,UL,UB,DR,DF are not in the
		// UD-slice and the index is <20160
		for (var uRtoUL = 0; uRtoUL < 336; uRtoUL++) {
			for (var uBtoDF = 0; uBtoDF < 336; uBtoDF++) {
				MergeURtoULandUBtoDF[uRtoUL][uBtoDF] = CubieCube.getURtoDF(uRtoUL, uBtoDF);
			}
		}
		var data = "";
		for (var i = 0; i < 336; i++) {
			data += new Buffer(new Uint8Array(MergeURtoULandUBtoDF[i].buffer)).toString('binary');
		}
		fs.writeFileSync(filename, data, 'binary');
	}
}());


// ****************************************Pruning tables for the search*********************************************


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Pruning table for the permutation of the corners and the UD-slice edges in phase2.
// The pruning table entries give a lower estimation for the number of moves to reach the solved cube.
//static byte[] Slice_URFtoDLF_Parity_Prun = new byte[N_SLICE2 * N_URFtoDLF * N_PARITY / 2];
var Slice_URFtoDLF_Parity_Prun = CoordCubie.Slice_URFtoDLF_Parity_Prun = new Buffer(N_SLICE2 * N_URFtoDLF * N_PARITY / 2);
(function () {
	var filename = path.join(tableDir, "Slice_URFtoDLF_Parity_Prun.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading Slice_URFtoDLF_Parity_Prun...");
		var data = fs.readFileSync(filename);
		Slice_URFtoDLF_Parity_Prun = CoordCubie.Slice_URFtoDLF_Parity_Prun = data;
	} else {
		console.log("Generating Slice_URFtoDLF_Parity_Prun...");
		for (var i = 0; i < N_SLICE2 * N_URFtoDLF * N_PARITY / 2; i++)
			Slice_URFtoDLF_Parity_Prun[i] = -1;
		var depth = 0;
		setPruning(Slice_URFtoDLF_Parity_Prun, 0, 0);
		var done = 1;
		while (done !== N_SLICE2 * N_URFtoDLF * N_PARITY) {
			//console.log(done, N_SLICE2 * N_URFtoDLF * N_PARITY);
			for (var i = 0; i < N_SLICE2 * N_URFtoDLF * N_PARITY; i++) {
				var parity = i % 2;
				var URFtoDLF = ~~((~~(i / 2)) / N_SLICE2);
				var slice = (~~(i / 2)) % N_SLICE2;
				var depthTest = getPruning(Slice_URFtoDLF_Parity_Prun, i);
				if (depthTest === depth) {
					for (var j = 0; j < 18; j++) {
						switch (j) {
							case 3:
							case 5:
							case 6:
							case 8:
							case 12:
							case 14:
							case 15:
							case 17:
								continue;
							default:
								var newSlice = FRtoBR_Move[slice][j];
								var newURFtoDLF = URFtoDLF_Move[URFtoDLF][j];
								var newParity = parityMove[parity][j];
								if (getPruning(Slice_URFtoDLF_Parity_Prun, (N_SLICE2 * newURFtoDLF + newSlice) * 2 + newParity) === 0x0f) {
									setPruning(Slice_URFtoDLF_Parity_Prun, (N_SLICE2 * newURFtoDLF + newSlice) * 2 + newParity, (depth + 1));
									done++;
								}
						}
					}
				}
			}
			depth++;
		}
		
		fs.writeFileSync(filename, Slice_URFtoDLF_Parity_Prun);
	}
}());

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Pruning table for the permutation of the edges in phase2.
// The pruning table entries give a lower estimation for the number of moves to reach the solved cube.
//static byte[] Slice_URtoDF_Parity_Prun = new byte[N_SLICE2 * N_URtoDF * N_PARITY / 2];
var Slice_URtoDF_Parity_Prun = CoordCubie.Slice_URtoDF_Parity_Prun = new Buffer(N_SLICE2 * N_URtoDF * N_PARITY / 2);
(function () {
	
	var filename = path.join(tableDir, "Slice_URtoDF_Parity_Prun.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading Slice_URtoDF_Parity_Prun...");
		var data = fs.readFileSync(filename);
		Slice_URtoDF_Parity_Prun = CoordCubie.Slice_URtoDF_Parity_Prun = data;
	} else {
		console.log("Generating Slice_URtoDF_Parity_Prun...");
		for (var i = 0; i < N_SLICE2 * N_URtoDF * N_PARITY / 2; i++)
			Slice_URtoDF_Parity_Prun[i] = -1;
		var depth = 0;
		setPruning(Slice_URtoDF_Parity_Prun, 0, 0);
		var done = 1;
		while (done !== N_SLICE2 * N_URtoDF * N_PARITY) {
			for (var i = 0; i < N_SLICE2 * N_URtoDF * N_PARITY; i++) {
				var parity = i % 2;
				var URtoDF = ~~((~~(i / 2)) / N_SLICE2);
				var slice = ~~(i / 2) % N_SLICE2;
				if (getPruning(Slice_URtoDF_Parity_Prun, i) === depth) {
					for (var j = 0; j < 18; j++) {
						switch (j) {
							case 3:
							case 5:
							case 6:
							case 8:
							case 12:
							case 14:
							case 15:
							case 17:
								continue;
							default:
								var newSlice = FRtoBR_Move[slice][j];
								var newURtoDF = URtoDF_Move[URtoDF][j];
								var newParity = parityMove[parity][j];
								if (getPruning(Slice_URtoDF_Parity_Prun, (N_SLICE2 * newURtoDF + newSlice) * 2 + newParity) === 0x0f) {
									setPruning(Slice_URtoDF_Parity_Prun, (N_SLICE2 * newURtoDF + newSlice) * 2 + newParity, (depth + 1));
									done++;
								}
						}
					}
				}
			}
			depth++;
		}

		fs.writeFileSync(filename, Slice_URtoDF_Parity_Prun);
	}
}());

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Pruning table for the twist of the corners and the position (not permutation) of the UD-slice edges in phase1
// The pruning table entries give a lower estimation for the number of moves to reach the H-subgroup.
//static byte[] Slice_Twist_Prun = new byte[N_SLICE1 * N_TWIST / 2 + 1];
var Slice_Twist_Prun = CoordCubie.Slice_Twist_Prun = new Buffer(N_SLICE1 * N_TWIST / 2 + 1);
(function () {
	var filename = path.join(tableDir, "Slice_Twist_Prun.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading Slice_Twist_Prun...");
		var data = fs.readFileSync(filename);
		Slice_Twist_Prun = CoordCubie.Slice_Twist_Prun = data;
	} else {
		console.log("Generating Slice_Twist_Prun...");
		for (var i = 0; i < N_SLICE1 * N_TWIST / 2 + 1; i++)
			Slice_Twist_Prun[i] = -1;
		var depth = 0;
		setPruning(Slice_Twist_Prun, 0, 0);
		var done = 1;
		while (done !== N_SLICE1 * N_TWIST) {
			for (var i = 0; i < N_SLICE1 * N_TWIST; i++) {
				var twist = ~~(i / N_SLICE1), slice = i % N_SLICE1;
				if (getPruning(Slice_Twist_Prun, i) === depth) {
					for (var j = 0; j < 18; j++) {
						var newSlice = ~~(FRtoBR_Move[slice * 24][j] / 24);
						var newTwist = twistMove[twist][j];
						if (getPruning(Slice_Twist_Prun, N_SLICE1 * newTwist + newSlice) === 0x0f) {
							setPruning(Slice_Twist_Prun, N_SLICE1 * newTwist + newSlice, (depth + 1));
							done++;
						}
					}
				}
			}
			depth++;
		}
		fs.writeFileSync(filename, Slice_Twist_Prun);
	}
}());

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Pruning table for the flip of the edges and the position (not permutation) of the UD-slice edges in phase1
// The pruning table entries give a lower estimation for the number of moves to reach the H-subgroup.
//static byte[] Slice_Flip_Prun = new byte[N_SLICE1 * N_FLIP / 2];
var Slice_Flip_Prun = CoordCubie.Slice_Flip_Prun = new Buffer(N_SLICE1 * N_FLIP / 2);
(function () {
	var filename = path.join(tableDir, "Slice_Flip_Prun.dat");
	if (fs.existsSync(filename)) {
		console.log("Loading Slice_Flip_Prun...");
		var data = fs.readFileSync(filename);
		Slice_Flip_Prun = CoordCubie.Slice_Flip_Prun = data;
		
	} else {
		console.log("Generating Slice_Flip_Prun");
		for (var i = 0; i < N_SLICE1 * N_FLIP / 2; i++)
			Slice_Flip_Prun[i] = -1;
		var depth = 0;
		setPruning(Slice_Flip_Prun, 0, 0);
		var done = 1;
		while (done !== N_SLICE1 * N_FLIP) {
			for (var i = 0; i < N_SLICE1 * N_FLIP; i++) {
				var flip = ~~(i / N_SLICE1), slice = i % N_SLICE1;
				if (getPruning(Slice_Flip_Prun, i) === depth) {
					for (var j = 0; j < 18; j++) {
						var newSlice = ~~(FRtoBR_Move[slice * 24][j] / 24);
						var newFlip = flipMove[flip][j];
						if (getPruning(Slice_Flip_Prun, N_SLICE1 * newFlip + newSlice) === 0x0f) {
							setPruning(Slice_Flip_Prun, N_SLICE1 * newFlip + newSlice, (depth + 1));
							done++;
						}
					}
				}
			}
			depth++;
		}
		fs.writeFileSync(filename, Slice_Flip_Prun);

	}
}());

console.log("All tables generated/loaded");


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Set pruning value in table. Two values are stored in one byte.
function setPruning(table, index, value) {
	if ((index & 1) == 0)
		table[~~(index / 2)] &= 0xf0 | value;
	else
		table[~~(index / 2)] &= 0x0f | (value << 4);
}
CoordCubie.setPruning = setPruning;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Extract pruning value
function getPruning(table, index) {
	if ((index & 1) === 0)
		return (table[~~(index / 2)] & 0x0f);
	else
		return ((table[~~(index / 2)] & 0xf0) >>> 4);
}
CoordCubie.getPruning = getPruning;

