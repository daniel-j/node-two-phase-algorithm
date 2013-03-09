
var enums = require('enums');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Then names of the edge positions of the cube. Edge UR e.g., has an U(p) and R(ight) facelet.
module.exports = new enums.Enum('UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR');
