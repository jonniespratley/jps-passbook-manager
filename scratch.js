'use strict';

const SignPass = require('./lib/signpass')();

var output_url = './tmp';
var wwdr_url = './certificates/wwdr-authority.pem';
var cert_url = './certificates/passbookmanager-cert.p12';
var cert_pass = 'fred';
var pass_url = '/Users/jps/Github/jps-passbook-manager/data/passes/1d6d844b-77ea-47b2-9414-2e9d0ea414f5.raw';
var signpass = new SignPass(pass_url, cert_url, cert_pass, output_url);

signpass.sign_pass();
