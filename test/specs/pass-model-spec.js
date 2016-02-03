var path = require('path');
var assert = require('assert');
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var Pass = program.get('Pass');
var p;

describe('Pass', function() {
	it('should create default generic Pass', function(done) {
		assert(Pass);
		p = new Pass();
		assert.ok(p._id);
		assert.equal(p.type, 'generic');
		done();
	});

	it('should create pass model with [storeCard] type', function(done) {
		p = new Pass({
			type: 'storeCard'
		});
		assert.ok(p.storeCard);
		assert.equal(p.type, 'storeCard');
		done();
	});

	it('should create pass model with teamIdentifier, passTypeIdentifier, and webServiceURL from config', function(done) {
		p = new Pass({
			type: 'generic'
		});

		assert.equal(p.type, 'generic');
		assert(p.generic);

		assert(p.serialNumber);
		assert(p.teamIdentifier);
		assert(p.passTypeIdentifier);
		assert(p.webServiceURL);
		done();
	});
});
