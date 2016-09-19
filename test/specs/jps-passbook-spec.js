'use strict';
var assert = require('assert'),
	path = require('path'),
	_ = require('lodash'),
	fs = require('fs-extra'),
	SignPass = require(path.resolve(__dirname, '../../lib/signpass')),
	Passbook = require(path.resolve(__dirname, '../../lib/jps-passbook'));

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var jpsPassbook = new Passbook(program);

var mockIdentifer = mocks.mockIdentifer;
var mockPass = mocks.mockPass;
var mockPasses = mocks.mockPasses;
var _passes = [];
var passFiles = [];

describe('jps-passbook', function() {

	describe('Batching', function() {
		before(function() {
			program.db.saveAll(mocks.mockPasses).then(function(resp) {
				mockPasses = resp;
				console.log('GOT PASSES', resp);
			});
		});

		it('batchPromise("create", passes) - should create each pass in database', function(done) {
			jpsPassbook.batchPromise('create', mockPasses).then(function(_resp) {
				assert(_resp);
				done();
			}).catch(function(err) {
				assert.fail(err);
				done();
			});
		});

		it('batchPromise("sign", passes) - should create each pass in database', function(done) {
			this.timeout(10000);
			var mockIds = _.pluck(mockPasses, '_id');
			console.log('mockIds', mockIds);
			jpsPassbook.batchPromise('sign', mockPasses).then(function(_resp) {
				console.log(_resp);
				assert(_resp);
				assert(mockIds.length === _resp.length);
				assert(fs.existsSync(_resp.dest), 'returns .pkpass path');
				done();
			}).catch(function(err) {
				assert.fail(err);
				done();
			});
		});
	});


	describe('Passes', function() {

		it('savePassTypeIdentifier() - should create pass certs and save passTypeIdentifier to database successfully.',
			function(done) {
				jpsPassbook.savePassTypeIdentifierPromise(mockIdentifer).then(function(p) {
					assert(p);
					done();
				}).catch(function(err) {
					assert.fail(err);
					done();
				});
			});

		it('savePassTypeIdentifier() - should should fail when no p12 present.', function(done) {
			jpsPassbook.savePassTypeIdentifierPromise({
				passphrase: 'test',
				passTypeIdentifier: 'test'
			}).then(function(p) {
				assert.fail(p);
				done();
			}).catch(function(err) {
				assert(err);
				done();
			});
		});

		it('savePassTypeIdentifier() - should should fail when no passphrase present.', function(done) {
			jpsPassbook.savePassTypeIdentifierPromise({
				passTypeIdentifier: 'test'
			}).then(function(p) {
				assert.fail(p);
				done();
			}).catch(function(err) {
				assert(err);
				done();
			});
		});

		it('getPassCerts() - should get pass certs from database successfully.', function(done) {
			jpsPassbook.getPassCerts(mockPass.passTypeIdentifier, function(err, p) {
				if (err) {
					assert.fail(err);
				}
				assert.ok(p);
				done();
			});
		});

		it('getPassCerts() - should get pass certs from database fail.', function(done) {
			jpsPassbook.getPassCerts('unknown-id', function(err, p) {
				assert(err);
				done();
			});
		});

		it('createPassPromise() - should create pass .raw and resolve promise', function(done) {
			jpsPassbook.createPassPromise(mockPass).then(function(p) {
				assert(fs.existsSync(p.rawFilename), 'returns .raw path');
				done();
			});
		});


		describe('Signing', function() {

			before(function(done) {
				program.db.get(mockPass._id).then(function(resp) {
					mockPass = resp;
					//	mockPass = resp[0];
					console.log('Using Mock Pass', mockPass);
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

			it('signPassPromise() - should sign pass .raw into .pkpass and resolve promise', function(done) {
				jpsPassbook.signPassPromise(mockPass).then(function(p) {
					assert(fs.existsSync(p.dest), 'returns .pkpass path');
					done();
				});
			});

			describe('Validation', function() {
				it('validatePass() - should validate a pass', function(done) {
					jpsPassbook.validatePass(mockPass, function(err, p) {
						if (err) {
							assert.fail(err);
						}
						assert(p, 'returns pass');
						//	assert(p.filename, 'returns pass filename');
						assert(fs.existsSync(path.resolve(p.rawFilename, './manifest.json')));
						done();
					});
				});

				it('validatePassPromise() - should validate pass .pkpass signature and resolve promise', function(done) {
					done();
				});

			});
		});
	});



});
