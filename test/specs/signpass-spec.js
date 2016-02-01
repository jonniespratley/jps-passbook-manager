'use strict';
const fs = require('fs-extra');
const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const config = program.config.defaults;
const SignPass = require(path.resolve(__dirname, '../../lib/signpass'));
const jpsPassbook = require(path.resolve(__dirname, '../../lib/jps-passbook'))(program);

var options = mocks.mockIdentifer;

var signpass;
var mockPass = mocks.mockPass;
var passes = mocks.mockPasses;

var testPasses = [];
describe('SignPass', function() {

	before(function(done) {
		program.db.find({
			docType: 'pass'
		}).then(function(resp) {
			passes = resp;
			mockPass = resp[resp.length - 1];
			console.log('GOT PASSES', resp);
			done();
		});
	});

	it('should be defined', function(done) {
		assert(SignPass);
		done();
	});

	it('should return PassTypeId object', function(done) {
		options = SignPass.createPassTypeId(mocks.mockIdentifer.passTypeIdentifier, {});
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
			console.log('resp', resp);
			assert(fs.existsSync(resp.key));
			assert(fs.existsSync(resp.cert));
			done();
		});
	});

	it('should be fetch pass type info', function(done) {
		jpsPassbook.getPassCerts(mocks.mockIdentifer.passTypeIdentifier, function(err, resp) {
			options = resp;
			console.log('options', options);
			assert(options);
			done();
		});
	});

	xit('should create SignPass instance', function(done) {
		signpass = new SignPass(options);
		assert(signpass);
		done();
	});

	it('sign() - should create .zip and .pkpass files', function(done) {
		options.passFilename = mocks.mockPass.rawFilename;
		signpass = new SignPass(options);
		signpass.sign(function(err, resp) {
			console.log('signed', resp);
			assert(resp);
			assert(fs.existsSync(resp.dest));
			done();
		});
	});

	it('sign() - all passes - should create .zip and .pkpass for each pass type', function(done) {
		this.timeout(20000);
		var _done = _.after(SignPass.passTypes.length, function() {
			done();
		});

		_.forEach(SignPass.passTypes, function(type) {
			jpsPassbook.createPass({
				passTypeIdentifier: options.passTypeIdentifier,
				type: type.value
			}, function(err, _pass) {
				assert(_pass);
				options.passFilename = _pass.rawFilename;
				testPasses.push(_pass);
				signpass = new SignPass(options);
				signpass.signPromise().then(function(resp) {
					assert(resp);
					assert(fs.existsSync(resp.dest));
					_done(resp);
				}).catch(function(err) {
					assert.fail(err);
					_done();
				});
			});
		});
	});
});
