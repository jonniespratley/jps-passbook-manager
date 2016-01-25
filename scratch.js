'use strict';
var assert = require('assert');
var fs = require('fs-extra');
var _ = require('lodash');
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
const SignPass = require('./lib/signpass');

var output_url = path.resolve(__dirname, './tmp');
var wwdr_url = path.resolve(__dirname, './certificates/wwdr-authority.pem');
var cert_url = path.resolve(__dirname, './certificates/pass-passbookmanager-cert.pem');
var key_url = path.resolve(__dirname, './certificates/pass-passbookmanager-key.pem');
var cert_pass = 'fred';
var pass_url = path.resolve(__dirname, './data/passes/pass-jonniespratley.raw');

fs.ensureDirSync(output_url);


var logger = utils.getLogger('scratch');

var APN_CERT = './certificates/passbookmanager-apns-cert.p12';
var APN_KEY = './certificates/passbookmanager-apns-key.p12';
var APN_CERT_PEM = APN_CERT.replace('.p12', '.pem');
var APN_KEY_PEM = APN_KEY.replace('.p12', '.pem');
var APN_KEY_PEM_PASS = 'fred';

// TODO: Sign cert_pass
var exec = child_process.exec;

//var cmd1 = `openssl x509 -in ${APN_CERT} -inform DER -outform PEM -out ${APN_CERT_PEM}`
var cmd1 = `openssl pkcs12 -clcerts -nokeys -out ${APN_CERT_PEM} -in ${APN_CERT}`;
var cmd2 = `openssl pkcs12 -in ${APN_KEY} -out ${APN_KEY_PEM} -nodes`;
var cmd3 = `openssl s_client -connect gateway.sandbox.push.apple.com:2195 -cert ${APN_CERT_PEM} -key ${APN_KEY_PEM}`;
var cmd4 = `openssl s_client -connect gateway.push.apple.com:2195 -cert ${APN_CERT_PEM} -key ${APN_KEY_PEM}`
var cmd5 =
	`openssl smime -binary -sign -certfile ${wwdr_url} -signer ${cert_url} -inkey ${key_url} -in manifest.json -out signature -outform DER -passin pass:fred`;
var cmd6 = `zip -R pass.zip *`

/*
logger('cmd1', cmd1);
logger('cmd2', cmd2);
logger('cmd3', cmd3);
logger('cmd4', cmd4);
logger('cmd5', cmd5);
*/

//child_process.execSync(cmd1);
//child_process.execSync(cmd2);
//child_process.execSync(cmd3);
//
//child_process.execSync(cmd5);
//child_process.execSync(cmd6);


var cmds =
	`
	openssl pkcs12 -clcerts -nokeys -out ${APN_CERT_PEM} -in ${APN_CERT}
	openssl pkcs12 -nocerts -out ${APN_KEY_PEM} -in ${APN_KEY}
	cat ${APN_CERT_PEM} ${APN_KEY_PEM} > ./certificates/apns-production.pem
	openssl s_client -connect gateway.push.apple.com:2195 -cert ${APN_CERT_PEM} -key ${APN_KEY_PEM}
`;
//console.log(cmds);
const GITHUB_USERS = [
	'sindresorhus',
	'eddiemonge',
	'addyosmani',
	'jonniespratley'
];


function downloadGithubAvatar(user, output) {
	if (!user.avatar_url) {
		return;
	}
	let filename = path.resolve(output, './thumbnail@2x.png');
	logger('downloadGithubAvatar', user.avatar_url);

	request
		.get(user.avatar_url)
		.on('error', function(err) {
			console.log(err)
		})
		.pipe(require('fs').createWriteStream(filename))


}
/*
_.forEach(GITHUB_USERS, function(n) {

	utils.githubToPass(n, function(err, resp) {
		logger('github user', resp);

		//request(user.avatar_url).pipe(fs.createWriteStream(user.name + '@2x.png'))
		jpsPassbook.createPass(resp.pass, function(err, pass) {
			logger('create github pass', resp);

			downloadGithubAvatar(resp.user, pass.filename);
			signPass(pass.filename);

		});
	});

});



request('https://passbook-manager.run.aws-usw02-pr.ice.predix.io/api/v1/admin/find?docType=registration', function(err,
	resp, body) {
	var docs = JSON.parse(body);
	docs.forEach(function(doc) {
		program.db.put(doc);
	});
});
var pem = require('pem');
pem.readCertificateInfo('./certificates/pass-cert.pem', function(err, data) {
	logger('data', data);
});

*/
var pem = require('pem');
var _cert = fs.readFileSync(path.resolve(__dirname, './certificates/pass.cert'));
pem.readCertificateInfo(_cert, function(err, data) {
	logger('readCertificateInfo', err, data);
});

var cert_url = path.resolve(__dirname, './certificates/pass.p12');



utils.createCerts(cert_url, 'fred').forEach(function(cmd) {
	//	child_process.execSync(cmd);
	console.log(cmd);
});



function signPass(raw) {

	var options = {
		passFilename: raw,
		certFilename: path.resolve(__dirname, './certificates/pass-passbookmanager-cert.pem'),
		certPassword: cert_pass,
		keyFilename: path.resolve(__dirname, './certificates/pass-passbookmanager-key.pem'),
		wwdrFilename: wwdr_url,
		outputFilename: output_url,
		compress: true
	};

	var signpass = new SignPass(options);
	signpass.sign(function(err, resp) {
		console.warn('signPass', resp);
	});
}

program.db.find({
	docType: 'pass'
}).then(function(resp) {
	resp.forEach(function(pass) {
		logger('sign ', pass.filename);
		//	signPass(pass.filename);
	});

})
