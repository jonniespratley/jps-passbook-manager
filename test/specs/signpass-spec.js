'use strict';
const fs = require('fs-extra');
const assert = require('assert');
const path = require('path');
const SignPass = require(path.resolve(__dirname, '../../lib/signpass'));
var signpass;

var certFilename = path.resolve(__dirname, '../../certificates/pass-passbook-manager-cert.pem');
var keyFilename = path.resolve(__dirname, '../../certificates/pass-passbook-manager-key.pem');
var wwdrFilename = path.resolve(__dirname, '../../certificates/wwdr-authority.pem');
var certPass = 'fred';
var passFilename = path.resolve(__dirname, '../../data/mock-coupon.json');
var rawpassFilename = path.resolve(__dirname, '../../data/passes/mock-coupon.raw');
var pkpassFilename = path.resolve(__dirname, '../../data/passes/mock-coupon.pkpass');
var outputFilename = path.resolve(__dirname, '../../.tmp/passes/mock-coupon.pkpass');
//var cert = fs.readFileSync(certFilename);
//var key = fs.readFileSync(keyFilename);

describe('SignPass', function (done) {

	it('should be defined', function (done) {
		assert(SignPass);
		done();
	});

	it('should create instance', function (done) {
		signpass = new SignPass(
			rawpassFilename,
			certFilename,
			certPass,
			keyFilename,
			wwdrFilename,
			outputFilename, true);
		assert(signpass);
		done();
	});

	it('should sign_pass', function (done) {
		signpass.sign_pass(function(err, file){
			assert(file);
			done();
		});
	});

});
