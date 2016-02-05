'use strict';

var assert = require('assert'),
	path = require('path'),
	_ = require('lodash'),
	fs = require('fs-extra');

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));

const program = mocks.program;
const jpsPassbook = program.get('jpsPassbook');
const db = program.get('db');

var mockIdentifer = mocks.mockIdentifer;
var mockPass = mocks.mockPass;
var mockPasses = mocks.mockPasses;


describe('jps-passbook', function () {

	describe('Identifiers', function () {
		it('savePassTypeIdentifierPromise() - should create pass certs and save passTypeIdentifier to database successfully.',
			function (done) {
				jpsPassbook.savePassTypeIdentifierPromise(mockIdentifer).then(function (p) {
					assert(p);
					done();
				}).catch(function (err) {
					assert.fail(err);
					done();
				});
			});

		it('savePassTypeIdentifierPromise() - should should reject when no p12 present.', function (done) {
			jpsPassbook.savePassTypeIdentifierPromise({
				passphrase: 'test',
				passTypeIdentifier: 'test'
			}).then(function (p) {
				assert.fail(p);
				done();
			}).catch(function (err) {
				assert(err);
				done();
			});
		});

		it('savePassTypeIdentifierPromise() - should should reject when no passphrase present.', function (done) {
			jpsPassbook.savePassTypeIdentifierPromise({
				passTypeIdentifier: 'test'
			}).then(function (p) {
				assert.fail(p);
				done();
			}).catch(function (err) {
				assert(err);
				done();
			});
		});

		it('getPassTypeIdentifier() - should get pass certs from database.', function (done) {
			jpsPassbook.getPassTypeIdentifier(mockPass.passTypeIdentifier, function (err, p) {
				if (err) {
					assert.fail(err);
				}
				assert(p);
				done();
			});
		});

		it('getPassTypeIdentifier() - should get pass certs from database fail.', function (done) {
			jpsPassbook.getPassTypeIdentifier('unknown-id', function (err, p) {
				assert(err);
				done();
			});
		});

		it('getPassTypeIdentifierPromise() - should get pass certs from database and resolve promise.', function (done) {
			jpsPassbook.getPassTypeIdentifierPromise(mockPass.passTypeIdentifier).then(function (p) {
				assert(p);
				done();
			}).catch(function (err) {
				assert(err);
				done();
			});
		});

		it('getPassTypeIdentifierPromise() - should reject promise when pass certs from database fail.', function (done) {
			jpsPassbook.getPassTypeIdentifierPromise('unknown-id').then(function (p) {
				assert.fail(p);
				done();
			}).catch(function (err) {
				assert(err);
				done();
			});
		});
	});

	describe('Batching', function () {

		before(function () {
			program.db.saveAll(mocks.mockPasses).then(function (resp) {
				mockPasses = resp;
			});
		});

		it('batchPromise("create", passes) - should create each pass in database', function (done) {
			jpsPassbook.batchPromise('create', mockPasses).then(function (_resp) {
				assert(_resp);
				done();
			}).catch(function (err) {
				assert.fail(err);
				done();
			});
		});

		it('batchPromise("sign", passes) - should create each pass in database', function (done) {
			this.timeout(10000);
			program.db.find({
				docType: 'pass',
				passTypeIdentifier: mockIdentifer.passTypeIdentifier
			}).then(function (resp) {
				mockPasses = resp;

				var _done = _.after(mockPasses.length, function () {
					done();
				});

				jpsPassbook.batchPromise('sign', mockPasses).then(function (_resp) {
					assert(_resp);
					assert(mockPasses.length === _resp.length);
					_.forEach(_resp, function (obj) {
						assert(fs.existsSync(obj.dest), 'returns .pkpass path');
						_done();
					});

				}).catch(function (err) {
					assert.fail(err);
					done();
				});
			});
		});
	});


	describe('Passes', function () {


		it('createPassPromise() - should create pass .raw and resolve promise', function (done) {
			jpsPassbook.createPassPromise(mockPass).then(function (p) {
				assert(fs.existsSync(p.rawFilename), 'returns .raw path');
				done();
			}).catch(function (err) {
				assert.fail(err);
				done();
			});
		});

		describe('Signing', function () {

			before(function (done) {
				db.get(mockPass._id).then(function (resp) {
					mockPass = resp;
					//	mockPass = resp[0];
					console.log('Using Mock Pass', mockPass);
					done();
				}).catch(function (err) {

					done();
				});
			});

			it('signPass() - should sign .raw package into a .pkpass', function (done) {
				jpsPassbook.signPass(mockPass, function (err, p) {
					if (err) {
						assert.fail(err);
					}
					assert(fs.existsSync(p.dest), 'returns .pkpass path');
					done();
				});
			});

			it('signPassPromise() - should sign pass .raw into .pkpass and resolve promise', function (done) {
				jpsPassbook.signPassPromise(mockPass).then(function (p) {
					assert(fs.existsSync(p.dest), 'returns .pkpass path');
					done();
				}).catch(function (err) {
					assert.fail(err);
					done();
				});
			});
		});

		describe('Validation', function () {
			it('validatePass() - should validate a pass', function (done) {
				jpsPassbook.validatePass(mockPass, function (err, p) {
					if (err) {
						assert.fail(err);
					}
					assert(p, 'returns pass');
					assert(fs.existsSync(path.resolve(p.rawFilename, './manifest.json')));
					done();
				});
			});

			it('validatePassPromise() - should validate pass .pkpass signature and resolve promise', function (done) {
				jpsPassbook.validatePassPromise(mockPass).then(function (p) {
					assert(p, 'returns pass');
					assert(fs.existsSync(path.resolve(p.rawFilename, './manifest.json')));
					done();
				}).catch(function(err){
					assert.fail(err);
					done();
				});
			});
		});
	});
});
