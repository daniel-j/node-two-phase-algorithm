
node-two-phase-algorithm
============

An algorithm to solve Rubik's cube.
------------

The Two-Phase-Algorithm was created by Herbert Kociemba, read more: http://kociemba.org/cube.htm
This is a Node.js module ported from his Java package.

This module uses child_process.fork() to keep the main process from freezing.

### Example code/usage:

	#!/usr/bin/env node
	var twophase = require('twophase');

	console.log("Initiating algorithm...");
	twophase.initialize(function () {
		console.log("Ready");

		// This just tests the solve, solution is F
		twophase.solve("UUUUUURRRDRRDRRDRRFFFFFFFFFLLLDDDDDDLLULLULLUBBBBBBBBB", 30, 60, false, function (err, solution) {
			if (err) console.error(err);

			twophase.randomCube(function (err, randomCube) {
				if (err) console.error(err);
				var cube = randomCube;
				//cube = "DUDLUDLFDRBRFRBLUUBUBLFRLDFFFUDDBRDRBFUBLUULDFRLRBLBRF";
				console.log(cube);

				twophase.solve(cube, 30, 60, false, function (err, solution) {
					if (err) console.error(err);
					console.log("Solution:", solution);
					twophase.close();
				});
			});
			
		});
	});

Other (unused in the example) methods:
`twophase.verify(cube, callback);`
callback contains the parameters (err, code)