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
var _passes = [];
var passFiles = [];
var mockIdentifer = {
	passTypeIdentifier: 'pass.io.passbookmanager',
	wwdr: path.resolve(__dirname, '../../certificates/wwdr-authority.pem'),
	p12: path.resolve(__dirname, '../../certificates/pass.io.passbookmanager.p12'),
	passphrase: 'fred'
};

describe('jps-passbook', function() {
	before(function(done) {
		program.db.find({
			docType: 'pass'
		}).then(function(resp) {
			_passes = resp;
			mockPass = resp[resp.length - 1];
			console.log('GOT PASSES', resp);
			done();
		});
	});


	it('savePassTypeIdentifier() - should create pass certs and save passTypeIdentifier to database.', function(done) {
		jpsPassbook.savePassTypeIdentifier(mockIdentifer, function(err, p) {
			if (err) {
				assert.fail(err);
				done();
			}
			assert(p);
			done();
		});
	});

	it('getPassCerts() - should get pass certs from database.', function(done) {
		jpsPassbook.getPassCerts(mockIdentifer.passTypeIdentifier, function(err, p) {
			if (err) {
				assert.fail(err);
			}
			assert.ok(p);
			done();
		});
	});

	it('validatePass() - should validate a pass', function(done) {
		jpsPassbook.validatePass(mockPass, function(err, p) {
			if (err) {
				assert.fail(err);
			}
			assert(p, 'returns pass');
			assert(p.filename, 'returns pass filename');
			assert(fs.existsSync(path.resolve(p.filename, './manifest.json')));
			done();
		});
	});

	it('signPass() - should sign .raw package into a .pkpass', function(done) {
		jpsPassbook.signPass(mockPass, function(err, p) {
			if (err) {
				assert.fail(err);
			}
			assert(fs.existsSync(p.dest), 'returns .pkpass path');
			done();
		});
	});



	it('createPassPromise() - should create pass .raw and resolve promise', function(done) {
		jpsPassbook.createPassPromise(mockPass).then(function(p) {
			assert(fs.existsSync(p.rawFilename), 'returns .raw path');
			done();
		});
	});

	it('signPassPromise() - should sign pass .raw into .pkpass and resolve promise', function(done) {
		jpsPassbook.signPassPromise(mockPass).then(function(p) {
			assert(fs.existsSync(p.dest), 'returns .pkpass path');
			done();
		});
	});

	it('validatePassPromise() - should validate pass .pkpass signature and resolve promise', function(done) {
		done();
	});

	it('batchPromise("create", passes) - should create each pass in database', function(done) {
		jpsPassbook.batchPromise('create', _passes).then(function(_resp) {
			assert(_resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});
	it('batchPromise("sign", passes) - should create each pass in database', function(done) {
		jpsPassbook.batchPromise('sign', _passes).then(function(_resp) {
			assert(_resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});


});
