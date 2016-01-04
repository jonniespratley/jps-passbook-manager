var path = require('path');
var assert = require('assert');
var Pass = require(path.resolve(__dirname, '../../lib/models/pass.js'));
var p;


describe('Pass Model', function(){
	it('should create default model',function(){
		assert(Pass);
		p = new Pass();
		assert.ok(p._id);
	});

	it('should create model with passes params', function(){
		p = new Pass({type: 'generic'});
		assert.equal(p.type, 'generic');
	})
});
