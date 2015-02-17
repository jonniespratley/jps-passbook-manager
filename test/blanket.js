var path = require('path');
var srcDir = path.join(__dirname, '..', 'routes');
require('blanket')({
	// Only files that match the pattern will be instrumented
	pattern: srcDir
});