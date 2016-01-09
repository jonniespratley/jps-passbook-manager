'use strict';
var assert = require('assert');
var path = require('path');
var request = require("request");
var program = require(path.resolve(__dirname, './lib/program.js'))();
var config = program.config.defaults;
var Passbook = require(path.resolve(__dirname, './lib/jps-passbook'))
var jpsPassbook = new Passbook(program);
var utils = require(path.resolve(__dirname, './lib/utils.js'));
var Pass = require(path.resolve(__dirname, './lib/models/pass.js'));
//var Passes = require(path.resolve(__dirname, './lib/models/passes.js'));
var Device = require(path.resolve(__dirname, './lib/models/device.js'));
var child_process = require('child_process');
//const SignPass = require('./lib/signpass')();

var output_url = './tmp';
var wwdr_url = './certificates/wwdr-authority.pem';
var cert_url = './certificates/passbookmanager-cert.p12';
var cert_pass = 'fred';
var pass_url = '/Users/jps/Github/jps-passbook-manager/data/passes/1d6d844b-77ea-47b2-9414-2e9d0ea414f5.raw';

//var signpass = new SignPass(pass_url, cert_url, cert_pass, output_url);
//signpass.sign_pass();


var logger = utils.getLogger('scratch');



var APN_CERT = './certificates/passbookmanager-apns-cert.cer';
var APN_CERT_PEM = APN_CERT.replace('.cer', '.pem');
var APN_KEY = './certificates/passbookmanager-apns-key.p12';
var APN_KEY_PEM = APN_KEY.replace('.p12', '.pem');
var APN_KEY_PEM_PASS = '123456789';
// TODO: Sign cert_pass
var exec = child_process.exec;
var cmd1 = `openssl x509 -in ${APN_CERT} -inform DER -outform PEM -out ${APN_CERT_PEM}`
var cmd2 = `openssl pkcs12 -in ${APN_KEY} -out ${APN_KEY_PEM} -nodes`;
var cmd3 = `openssl s_client -connect gateway.sandbox.push.apple.com:2195 -cert ${APN_CERT_PEM} -key ${APN_KEY_PEM}`;
var cmd4 = `openssl s_client -connect gateway.push.apple.com:2195 -cert ${APN_CERT_PEM} -key ${APN_KEY_PEM}`

logger('cmd1', cmd1);
logger('cmd2', cmd2);
logger('cmd3', cmd3);
logger('cmd4', cmd4);

child_process.execSync(cmd1);
child_process.execSync(cmd2);
child_process.execSync(cmd3);
child_process.execSync(cmd4);


/*
	jpsPassbook.createPass(p, true, function(resp) {
		logger('create github pass', resp);
	});

request('https://passbook-manager.run.aws-usw02-pr.ice.predix.io/api/v1/admin/logs', function(err, resp, body) {
	var _logs = JSON.parse(body);
	_logs.forEach(function(log) {
		program.db.put(log);
	})
})*/
