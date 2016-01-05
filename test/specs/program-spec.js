var path = require('path');
var assert = require('assert');
var program = require(path.resolve(__dirname, '../../lib/program.js'))();
var config = program.config.defaults;
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
