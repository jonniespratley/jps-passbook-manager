'use strict';
const fs = require('fs-extra');
const _ = require('lodash');
const assert = require('assert');
const path = require('path');


const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const config = program.config.defaults;
var signpass;
const tmpdir = path.resolve(__dirname, '../../data/passes');

const SignPass = require(path.resolve(__dirname, '../../lib/signpass'));

const jpsPassbook = require(path.resolve(__dirname, '../../lib/jps-passbook'))(program);

const TEST_PASS_P12 = path.resolve(__dirname, '../../certificates/pass.io.passbookmanager.p12');
const TEST_PASS_TYPE_IDENTIFIER = 'pass.io.passbookmanager';
const TEST_PASSPHRASE = 'fred';


var options = {};
var passes = [];

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
		options = SignPass.createPassTypeId(TEST_PASS_TYPE_IDENTIFIER, {});
		assert(options);
		done();
	});

	it('should be fetch pass type info', function(done) {
		jpsPassbook.getPassCerts(TEST_PASS_TYPE_IDENTIFIER, function(err, resp) {
			options = resp;
			console.log('options', options);
			assert(options);
			done();
		});
	});


	it('createPems() - should create -cert.pem and -key.pem files from a .p12 certficate.', function(done) {
		SignPass.createPems(options, function(err, resp) {
			options = resp;
			console.log('resp', resp);
			assert(fs.existsSync(resp.key));
			assert(fs.existsSync(resp.cert));
			done();
		});
	});


	xit('sign_pass() - should create .zip and .pkpass files', function(done) {
		signpass.sign(function(err, resp) {
			files = resp;
			assert(resp);
			//	assert(fs.existsSync(files.zip));
			//	assert(fs.existsSync(files.pkpass));
			done();
		});
	});


	it('sign() - all passes - should create .zip and .pkpass for all passes', function(done) {
		this.timeout(15000);

		var _done = _.after(passes.length, function() {
			done();
		});

		// TODO: Sign each pass with cert.
		_.forEach(passes, function(pass) {
			jpsPassbook.createPass(pass, function(err, _pass) {
				//options.passFilename = _pass.filename;
				assert(_pass);
				_done();
				/*
									signpass = new SignPass(options);
									signpass.sign(function(err, resp) {
										assert(resp);
										assert(fs.existsSync(_pass.pkpass));
										_done(resp);
									});*/

			});
		});
	});


	xit('should create SignPass instance', function(done) {
		signpass = new SignPass(options);
		assert(signpass);
		done();
	});


});
