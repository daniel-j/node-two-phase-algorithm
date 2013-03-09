'use strict';

var child_process = require('child_process');

var child = null;

function initialize(cb) {
	child = child_process.fork(__dirname+'/fork.js');

	child.once('message', function (message) {
		cb(message);
	});
}
function close() {
	child.kill();
	child = null;
}

function solve(facelets, maxDepth, timeOut, useSeparator, cb) {
	child.send({solve: {facelets: facelets, maxDepth: maxDepth, timeOut: timeOut, useSeparator: useSeparator}});
	child.once('message', function (message) {
		if (typeof message === 'number') {
			cb(message, null); // error
		} else {
			cb(null, message);
		}
		
	});
}

function randomCube(cb) {
	child.send({randomCube: true});
	child.once('message', function (message) {
		cb(null, message);
	});
}

function verify(cb) {
	child.send({verify: true});
	child.once('message', function (message) {
		cb(null, message);
	});
}

module.exports.initialize = initialize;
module.exports.close = close;
module.exports.solve = solve;
module.exports.randomCube = randomCube;
module.exports.verify = verify;