'use strict';
const fs = require('fs-extra');
const assert = require('assert');
const path = require('path');
const SignPass = require(path.resolve(__dirname, '../../lib/signpass'));
var signpass;
var tmpdir = path.resolve(__dirname, '../temp');
fs.existsSync(tmpdir);
var certFilename = path.resolve(__dirname, '../../certificates/pass-passbook-manager-cert.pem');
var keyFilename = path.resolve(__dirname, '../../certificates/pass-passbook-manager-key.pem');
var wwdrFilename = path.resolve(__dirname, '../../certificates/wwdr-authority.pem');
var certPass = 'fred';
var passFilename = path.resolve(__dirname, '../../data/mock-coupon.json');
var rawpassFilename = path.resolve(__dirname, '../../data/passes/mock-coupon.raw');
var pkpassFilename = path.resolve(__dirname, '../../data/passes/mock-coupon.pkpass');
var outputFilename = path.resolve(__dirname, '../temp/passes/');
//var cert = fs.readFileSync(certFilename);
//var key = fs.readFileSync(keyFilename);
var files = null;
describe('SignPass', function(done) {

	it('should be defined', function(done) {
		assert(SignPass);
		done();
	});

	it('should create instance', function(done) {
		signpass = new SignPass(
			rawpassFilename,
			certFilename,
			certPass,
			keyFilename,
			wwdrFilename,
			outputFilename,
			true,
			tmpdir);

		assert(signpass);
		done();
	});

	it('should sign_pass', function(done) {
		signpass.sign_pass(function(err, resp) {
			files = resp;
			assert(resp);
			done();
		});
	});

	it('should have created files', function(done) {
		assert(fs.existsSync(files.zip));
		assert(fs.existsSync(files.pkpass));
		done();
	});



});
