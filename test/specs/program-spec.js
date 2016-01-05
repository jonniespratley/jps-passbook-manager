var path = require('path');
var assert = require('assert');
var config = require(path.resolve(__dirname, '../../config.json'));
var program = require(path.resolve(__dirname, '../../lib/program.js'))(config);

describe('Program', function() {
	it('should defined', function(done) {
		assert(program);
		done();
	});
	it('should have getLogger', function(done) {
		assert(program.getLogger);
		done();
	});
	it('should have db', function(done) {
		assert(program.db);
		done();
	});
});
