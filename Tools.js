'use strict';

var CubieCube = require('./CubieCube.js');
var CoordCube = require('./CoordCube.js');
var FaceCube = require('./FaceCube.js');

module.exports = {
	verify: function (s) {
		var count = new Int32Array(6);
		try {
			for (var i = 0; i < 54; i++)
				count[Color.valueOfStr(s.substring(i, i + 1)).ordinal()]++;
		} catch (e) {
			return -1;
		}

		for (var i = 0; i < 6; i++)
			if (count[i] != 9)
				return -1;

		var fc = new FaceCube(s);
		var cc = fc.toCubieCube();

		return cc.verify();
	},
	randomCube: function () {
		var cc = new CubieCube();
		cc.setFlip(~~(Math.random() * CoordCube.N_FLIP));
		cc.setTwist(~~(Math.random() * CoordCube.N_TWIST));
		do {
			cc.setURFtoDLB(~~(Math.random() * CoordCube.N_URFtoDLB));
			cc.setURtoBR(~~(Math.random() * CoordCube.N_URtoBR));
		} while ((cc.edgeParity() ^ cc.cornerParity()) != 0);
		var fc = cc.toFaceCube();
		return fc.toString();
	}
}