var assert = require('assert'),
	path = require('path'),
	_ = require('lodash'),
	fs = require('fs-extra'),
	os = require('os'),
	SignPass = require(path.resolve(__dirname, '../../lib/signpass')),
	Passbook = require(path.resolve(__dirname, '../../lib/jps-passbook'));

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var config = program.config.defaults;
var jpsPassbook = new Passbook(program);
var Pass = program.models.Pass;
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;
var testPass = mockPass;
var testPassfile = '';
var rawPassFolder = '';
var testPassDir = path.resolve(__dirname, '../../.tmp/');
var passFiles = [];

describe('jps-passbook', function() {

	it('createPass() - should create each pass type', function(done) {
		this.slow(10000);
		var _done = _.after(SignPass.passTypes.length, function() {
			done();
		});

		_.forEach(SignPass.passTypes, function(type) {
			console.log('create pass Type', type);
			jpsPassbook.createPass(new Pass({
				type: type.value
			}), function(err, data) {
				if (err) {
					assert.fail(err);
				}
				assert.ok(data._id);
				_done();
			});
		});
	});


	it('createPass() - should create each mocks.mockPasses', function(done) {
		this.slow(10000);
		var _passes = mocks.mockPasses;
		var _done = _.after(_passes.length, function() {
			done();
		});

		_.forEach(_passes, function(pass) {
			console.log('create pass Type', pass);
			jpsPassbook.createPass(pass, function(err, data) {
				if (err) {
					assert.fail(err);
				}
				assert.ok(data._id);
				_done();
			});
		});
	});

	it('createPass() - should create a pass .raw package', function(done) {
		console.log(passFiles);
		jpsPassbook.createPass(mockPass, function(err, p) {
			//		assert(fs.existsSync(p.rawFilename));
			assert.ok(p);
			done();
		});
	});

	it('signPass() - should sign .raw package into a .pkpass', function(done) {
		this.timeout(5000);
		jpsPassbook.signPass(mockPass, function(err, p) {
			assert.ok(p, 'returns pass location');
			//	assert(fs.existsSync(p.pkpassFilename));
			done();
		});
	});

	it('validatePass() - should validate a pass', function(done) {
		jpsPassbook.validatePass(mockPass, function(err, pass) {
			assert.ok(pass, 'returns pass');
			done();
		});
	});
});
