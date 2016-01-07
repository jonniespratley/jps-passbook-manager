var path = require('path');
var assert = require('assert');

var Passes = require(path.resolve(__dirname, '../../lib/models/passes.js'));
var p;
var program = require(path.resolve(__dirname, '../../lib/program.js'))();
var config = program.config.defaults;


describe('Passes', function () {
	it('should be defined', function (done) {
		assert(Passes);
		done();
	});

	it('getPasses() - should return all passes', function (done) {
		Passes.getPasses().then(function (resp) {
			assert.ok(resp);
			console.log(resp);
			done();
		});
	});

	it('add() - should add pass', function (done) {
		Passes.add({
			serialNumber: 'test-serialNumber'
		}).then(function (resp) {
			assert.ok(resp);
			done();
		});

	});

	xit('find(params) - should return pass that meets critera', function (done) {
		Passes.find({
			serialNumber: 'test-serialNumber'
		}).then(function (resp) {
			assert.ok(resp.serialNumber === 'test-serialNumber');
			assert.ok(resp);
			done();
		});

	});
});
