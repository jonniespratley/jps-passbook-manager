var path = require('path');
var assert = require('assert');

var Passes = require(path.resolve(__dirname, '../../lib/models/passes.js'));
var p;
var program = require(path.resolve(__dirname, '../../lib/program.js'))();
var config = program.config.defaults;

var mocks = require('../helpers/mocks');
describe('Passes', function() {
	it('should be defined', function(done) {
		assert(Passes);
		done();
	});

	it('getPasses() - should return all passes', function(done) {
		Passes.getPasses().then(function(resp) {
			assert.ok(resp);
			done();
		});
	});

	it('add() - should add pass', function(done) {
		Passes.add(mocks.mockPass).then(function(resp) {
			assert.ok(resp);
			done();
		});

	});

	it('find(params) - should return pass that meets critera', function(done) {

		Passes.find({
			//_id: 'mock-generic'
			serialNumber: mocks.mockPass.serialNumber
		}).then(function(resp) {
			console.log(resp);
			assert.ok(resp.serialNumber=== mocks.mockPass.serialNumber);
			assert.ok(resp);
			done();
		});

	});
});
