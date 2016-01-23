'use strict';
const fs = require('fs-extra');
const assert = require('assert');
const path = require('path');
const SignPass = require(path.resolve(__dirname, '../../lib/signpass'));
var signpass;
var tmpdir = path.resolve(__dirname, '../temp/passes');
fs.existsSync(tmpdir);
var certFilename = path.resolve(__dirname, '../../certificates/pass-passbook-manager-cert.pem');
var keyFilename = path.resolve(__dirname, '../../certificates/pass-passbook-manager-key.pem');
var wwdrFilename = path.resolve(__dirname, '../../certificates/wwdr-authority.pem');
var certPass = 'fred';


var passFilename = path.resolve(__dirname, '../../data/pass-jonniespratley.json');
var rawpassFilename = path.resolve(__dirname, '../../data/passes/pass-jonniespratley.raw');
var pkpassFilename = path.resolve(__dirname, '../../data/passes/pass-jonniespratley.pkpass');
var outputFilename = path.resolve(__dirname, '../temp/passes/');
var files = null;


describe('SignPass', function(done) {
	it('should be defined', function(done) {
		assert(SignPass);
		done();
	});

	it('should create SignPass instance', function(done) {
		signpass = new SignPass(
			rawpassFilename,
			certFilename,
			certPass,
			keyFilename,
			wwdrFilename,
			outputFilename,
			true,
			tmpdir
		);

		assert(signpass);
		done();
	});

	it('sign_pass() - should create .zip and .pkpass files', function(done) {
		signpass.sign_pass(function(err, resp) {
			files = resp;
			assert(resp);
			assert(fs.existsSync(files.zip));
			assert(fs.existsSync(files.pkpass));
			done();
		});
	});

});
