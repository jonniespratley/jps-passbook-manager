'use strict';
const fs = require('fs-extra');
const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));

const program = mocks.program;
const config = program.get('config');
const SignPass = program.get('SignPass');
const jpsPassbook = program.get('jpsPassbook');

var options = mocks.mockIdentifer;

var signpass;
var mockPass = mocks.mockPass;
var passes = mocks.mockPasses;

var testPasses = [];
describe('SignPass', function() {

	it('should be defined', function(done) {
		assert(SignPass);
		done();
	});

	xit('should create SignPass instance', function(done) {
		signpass = new SignPass(options);
		assert(signpass);
		done();
	});

	describe('Certs', function() {

		it('should return PassTypeId object', function(done) {
			options = SignPass.createPassTypeId(mockPass.passTypeIdentifier, {});
			assert(options);
			done();
		});

		it('createPems() - should create -cert.pem and -key.pem files from a .p12 certficate.', function(done) {
			SignPass.createPems({
				passphrase: mocks.mockIdentifer.passphrase,
				passTypeIdentifier: mocks.mockIdentifer.passTypeIdentifier,
				p12: mocks.mockIdentifer.p12,
				output: program.config.defaults.dataPath
			}, function(err, resp) {
				options = resp;
				if (err) {
					assert.fail(err);
					done();
				}

				assert(fs.existsSync(resp.key));
				assert(fs.existsSync(resp.p12));
				assert(fs.existsSync(resp.wwdr));
				assert(fs.existsSync(resp.cert));
				done();
			});
		});

		it('should be fetch pass type info', function(done) {
			jpsPassbook.getPassCerts(mocks.mockIdentifer.passTypeIdentifier, function(err, resp) {
				options = resp;
				if (err) {
					assert.fail(err);
					done();
				}
				assert(options);
				assert(fs.existsSync(resp.key));
				assert(fs.existsSync(resp.p12));
				assert(fs.existsSync(resp.wwdr));
				assert(fs.existsSync(resp.cert));
				done();
			});
		});
	});


	describe('Siging', function() {

		before(function() {
			jpsPassbook.createPassPromise(mockPass).then(function(resp) {
				mockPass = resp;
				//	mockPass = resp[0];
				console.log('Using Mock Pass', mockPass);

			});
		});

		it('sign() - should create .zip and .pkpass files', function(done) {
			options.passFilename = mockPass.rawFilename || mockPass.filename;
			signpass = new SignPass(options);
			signpass.sign(function(err, resp) {
				console.log('\n\n Signed using', options.passFilename);
				if (err) {
					assert.fail(err);
					done();
				}
				assert(resp);
				assert(fs.existsSync(resp.dest));
				done();
			});
		});



		describe('Batching', function() {
			var _passes = [];
			var _mockPassFilenames = [];


			before(function(done) {
				program.db.find({
					docType: 'pass'
				}).then(function(resp) {
					_passes = resp;
					_mockPassFilenames = _.pluck(resp, 'filename');
					console.log('GOT PASSES', resp);
					done();
				});
			});


			xit('sign() - all passes - should create .zip and .pkpass for each pass type', function(done) {
				this.timeout(10000);
				var _done = _.after(_mockPassFilenames.length, function() {
					done();
				});

				_.forEach(_mockPassFilenames, function(filename) {
					options.passFilename = filename;
					signpass = new SignPass(options);
					signpass.signPromise().then(function(resp) {
						assert(resp);
						assert(fs.existsSync(resp.dest));
						_done(resp);
					}).catch(function(err) {
						assert.fail(err);
						done();
					});
				});
			});

		});

	});


});
