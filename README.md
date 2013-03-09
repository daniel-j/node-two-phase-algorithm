
node-two-phase-algorithm
============

### An algorithm to solve Rubik's cube.

The Two-Phase-Algorithm was created by Herbert Kociemba, read more: http://kociemba.org/cube.htm

This is a Node.js module ported from his Java package.

This module uses child_process.fork() to keep the main process from freezing.

Installation
------------
Go to your node_modules folder and execute:
`git clone git://github.com/daniel-j/node-two-phase-algorithm.git twophase`

Example
-------
Here is an example to solve a random-generated cube:

``` javascript
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
```
Example output:
```
Initiating algorithm...
Generating/loading tables...
Loading twistMove...
Loading flipMove...
Loading FRtoBR_Move...
Loading URFtoDLF_Move...
Loading URtoDF_Move...
Loading URtoUL_Move...
Loading UBtoDF_Move...
Loading MergeURtoULandUBtoDF...
Loading Slice_URFtoDLF_Parity_Prun...
Loading Slice_URtoDF_Parity_Prun...
Loading Slice_Twist_Prun...
Loading Slice_Flip_Prun...
All tables generated/loaded
Ready
ULRRULBBDBFBRRFUULULLRFURRFDBRBDBRLDFFLDLDDDFUULUBFFDB
Solution: F' U F D' F' R B' L B2 D F' U F2 R2 D B2 R2 L2 U'
```

API
---
### twophase.initialize(callback)
This loads the algorithm and the tables (if the tables don't exist on disk, it generates them).
This can take some time, depending on your hardware.

### twophase.solve(facelets, maxDepth, timeOut, useSeparator, callback)
This will attempt to calculate a solution of a cube. The facelets are the faces of the cube you're trying to solve. A solved cube looks like this: `UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB`

maxDepth is the maximum moves that the algorithm will go before it gives up.

timeOut is the maximum time in seconds that the algorithm has to solve the cube in. If exceeded, it gives up.

### twophase.randomCube(callback)
This lets you generate random cubes as facelets data.

### twophase.verify(cube, callback)
This verifies if the cube is solvable.
callback contains the parameters (err, code)

### twophase.close()
This closes the fork/child process. Use it when you are finished with the module.
You can call initialize after close, as if you restarted the program.
This will regenerate/reload all the tables again, as with the first initialize call.


Credits
-------
Thanks to Herbert Kociemba for creating the original Two-Phase-Algorithm in Java. Also thanks to Hans Andersson for creating the LEGO Mindstorms cube solver Tilted Twister (http://tiltedtwister.com/), which got me started porting the Java-package in the first place.
And credits go to Dr. Axel Rauschmayer for creating the enums node.js module, which I needed to port the enums from Java: http://www.2ality.com/2011/10/enums.html
I had to modify it a bit, adding some methods and indices.