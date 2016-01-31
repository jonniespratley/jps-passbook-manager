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

	it('savePassTypeIdentifier() - should create pass certs and save passTypeIdentifier to database.', function(done) {
		//this.timeout(10000);
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
		//this.timeout(10000);
		jpsPassbook.getPassCerts(mockIdentifer.passTypeIdentifier, function(err, p) {
			assert.ok(p);
			done();
		});
	});

	it('createPass() - should create each mocks.mockPasses', function(done) {
		//	this.timeout(10000);
		_passes = mocks.mockPasses;
		var _done = _.after(_passes.length, function() {
			done();
		});

		_.forEach(_passes, function(_pass) {
			jpsPassbook.createPass(_pass, function(err, p) {
				if (err) {
					assert.fail(err);
				}
				assert.ok(p._id);
				_done();
			});
		});
	});

	xit('createPass() - should create each pass in database', function(done) {
		//	this.timeout(10000);
		program.db.find({
			docType: 'pass'
		}).then(function(resp) {
			_passes = resp;
			var _done = _.after(_passes.length, function() {
				done();
			});
			_.forEach(_passes, function(_pass) {
				jpsPassbook.createPass(_pass, function(err, p) {
					if (err) {
						assert.fail(err);
					}
					assert.ok(p._id);
					_done();
				});
			});
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});


	it('createPass() - should create a pass .raw package', function(done) {
		//	this.timeout(10000);
		var _done = _.after(_passes.length, function() {
			done();
		});
		_.forEach(_passes, function(_pass) {

			_.defer(function() {
				jpsPassbook.createPass(mockPass, function(err, p) {
					if (err) {
						assert.fail(err);
					}
					assert.ok(p);
					assert.ok(fs.existsSync(p.rawFilename));
					_done();
				});
			});

		});
	});

	it('signPass() - should sign .raw package into a .pkpass', function(done) {
		//this.timeout(10000);
		var _done = _.after(_passes.length, function() {
			done();
		});
		_.forEach(_passes, function(_pass) {

			jpsPassbook.signPass(mockPass, function(err, p) {
				if (err) {
					assert.fail(err);
				}
				assert.ok(p, 'returns pass location');
				//	assert(fs.existsSync(p.pkpassFilename));
				_done();
			});

		});
	});

	it('validatePass() - should validate a pass', function(done) {
		var _done = _.after(_passes.length, function() {
			done();
		});
		_.forEach(_passes, function(_pass) {
			jpsPassbook.validatePass(_pass, function(err, p) {
				if (err) {
					assert.fail(err);
				}
				assert.ok(p, 'returns pass');
				//assert.ok(fs.existsSync(path.resolve(p.rawFilename, './signature')));
				assert.ok(fs.existsSync(path.resolve(_pass.rawFilename, './manifest.json')));
				_done();
			});
		});
	});

});
