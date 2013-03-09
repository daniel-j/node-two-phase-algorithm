'use strict';

var Search = require('./Search.js');
var Tools = require('./Tools.js');

process.on('message', function (message) {
	if (typeof message.solve === 'object') {
		var solution = Search.solution(message.solve.facelets, message.solve.maxDepth, message.solve.timeOut, message.solve.useSeparator);
		process.send(solution);
	} else if (typeof message.randomCube !== 'undefined') {
		var randomCube = Tools.randomCube();
		process.send(randomCube);
	}else if (typeof message.verify !== 'undefined') {
		var code = Tools.verify();
		process.send(code);
	}
});

process.send("OK");