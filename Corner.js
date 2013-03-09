
var enums = require('enums');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//The names of the corner positions of the cube. Corner URF e.g., has an U(p), a R(ight) and a F(ront) facelet
module.exports = new enums.Enum('URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB');