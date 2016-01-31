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
var passes = [];
var signpass;

describe('SignPass', function(done) {

	it('should be defined', function(done) {
		assert(SignPass);
		done();
	});

	it('should be fetch pass', function(done) {
		program.models.Passes.getPasses().then(function(resp) {
			passes = resp;
			assert(passes);
			done();
		});
	});

	it('should return PassTypeId object', function(done) {
		options = SignPass.createPassTypeId(mocks.mockIdentifer.passTypeIdentifier, {});
		assert(options);
		done();
	});

	it('should be fetch pass type info', function(done) {
		jpsPassbook.getPassCerts(mocks.mockIdentifer.passTypeIdentifier, function(err, resp) {
			options = resp;
			console.log('options', options);
			assert(options);
			done();
		});
	});

	it('createPems() - should create -cert.pem and -key.pem files from a .p12 certficate.', function(done) {
		SignPass.createPems({
			passphrase: 'fred',
			passTypeIdentifier: 'pass.io.passbookmanager',
			p12: path.resolve(__dirname, '../../certificates/pass.io.passbookmanager.p12'),
			output: program.config.defaults.dataPath
		}, function(err, resp) {
			options = resp;
			console.log('resp', resp);
			assert(fs.existsSync(resp.key));
			assert(fs.existsSync(resp.cert));
			done();
		});
	});

	it('should create SignPass instance', function(done) {
		signpass = new SignPass(options);
		assert(signpass);
		done();
	});

	it('sign_pass() - should create .zip and .pkpass files', function(done) {
		options.passFilename = passes[0].rawFilename;
		signpass = new SignPass(options);
		signpass.sign(function(err, resp) {
			console.log('signed', resp);
			assert(resp);
			assert(fs.existsSync(resp.dest));
			done();
		});
	});

	it('sign() - all passes - should create .zip and .pkpass for all passes', function(done) {
		this.timeout(15000);
		var _done = _.after(passes.length, function() {
			done();
		});
		_.forEach(passes, function(pass) {
			jpsPassbook.createPass(pass, function(err, _pass) {
				assert(_pass);

				_pass.passTypeIdentifier = options.passTypeIdentifier;

				options.passFilename = _pass.rawFilename;
				signpass = new SignPass(options);
				signpass.sign(function(err, resp) {
					assert(resp);
					assert(fs.existsSync(resp.dest));
					_done(resp);
				});

			});
		});
	});

});
