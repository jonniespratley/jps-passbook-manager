var path = require('path');
var assert = require('assert');
var Pass = require(path.resolve(__dirname, '../../lib/models/pass.js'));
var p;
var program = require(path.resolve(__dirname, '../../lib/program.js'))();
var config = program.config.defaults;


describe('Pass', function() {
	it('should create default pass', function(done) {
		assert(Pass);
		p = new Pass();
		assert.ok(p._id);
		assert.equal(p.type, 'generic');
		done()
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
		//	assert.ok(p.storeCard);
		assert.equal(p.teamIdentifier, config.passkit.teamIdentifier);
		assert.equal(p.passTypeIdentifier, config.passkit.passTypeIdentifier);
		assert.equal(p.webServiceURL, config.passkit.webServiceURL);
		done();
	});
});
