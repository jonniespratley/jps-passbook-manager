'use strict';
const request = require('request');
const path = require('path');
const crypto = require('crypto');
const pkg = require(path.resolve(__dirname, '../package.json'));
const debug = require('debug');

var utils = {};


/*
 take a apple .p12 pass cert and make the pems.
 $ openssl pkcs12 -in cert.p12 -clcerts -nokeys -out certificate.pem
 $ openssl pkcs12 -in cert.p12 -nocerts -out key.pem
*/
function createCerts(p12, pass) {
	let _out = [];
	let _path = path.parse(p12);
	_path.ext = '.pem';
	_path.name += '-cert';

	let _outCert = p12.replace('.p12', '-cert.pem');
	let _cmd1 = `openssl pkcs12 -in ${p12} -passin pass:${pass} -clcerts -nokeys -out ${_outCert}`;
	_path.name += '-key';

	let _outKey = p12.replace('.p12', '-key.pem');
	let _cmd2 = `openssl pkcs12 -in ${p12} -nocerts -passout pass:${pass} -passin pass:${pass} -out ${_outKey}`;

	_out.push(_cmd1);
	_out.push(_cmd2);
	return _out;
}
utils.createCerts = createCerts;

utils.getLogger = function(name) {
	return debug(pkg.name + ':' + name);
};

var logger = utils.getLogger('utils');


function checksum(str, algorithm, encoding) {
	return crypto
		.createHash(algorithm || 'md5')
		.update(str, 'utf8')
		.digest(encoding || 'hex')
}
utils.checksum = checksum;


/**
 * I take a github username and fetch the user info
 * and return a pss object.
 * @param username
 */
var githubToPass = function(username, cb) {
	var Pass = require('./models/pass');
	let github = {};
	let pass = {
		description: null
	};

	var options = {
		method: 'GET',
		url: 'https://api.github.com/users/' + username,
		headers: {
			'User-Agent': 'jps-passbook-manager',
			'content-type': 'application/json'
		}
	};

	logger('githubToPass', 'request', options.method, options.url);
	request(options, function(error, response, body) {


		if (error) {
			throw new Error(error);
		}
		var user = JSON.parse(body);
		//	console.log(user);
		logger('githubToPass', 'response', user);
		var p = new Pass({
			_id: 'pass-' + user.login,
			type: 'github',
			generic: {

			}
		});

		p.description = `${user.name} Github`;
		p.logoText = 'Github';
		p.organizationName = user.company;

		p.generic.primaryFields = [{
			key: 'name',
			label: 'Name',
			value: user.name
		}];

		p.generic.secondaryFields = [{
			key: 'username',
			label: 'Username',
			value: user.username
		}];

		p.generic.auxiliaryFields = [{
			"key": "level",
			"label": "LEVEL",
			"value": "Platinum"
		}, {
			"key": "favorite",
			"label": "FAVORITE LANG",
			"value": "JavaScript",
			"textAlignment": "PKTextAlignmentRight"
		}];

		p.generic.auxiliaryFields = [{
			key: 'user_following',
			label: 'Following',
			value: user.following
		}, {
			label: 'Followers',
			key: 'user_followers',
			value: user.followers
		}, {
			label: 'Repos',
			key: 'repos',
			value: user.public_repos
		}, {
			label: 'Gists',
			key: 'gists',
			value: user.public_gists
		}, {
			label: 'Location',
			key: 'location',
			value: user.location
		}, {
			label: 'Blog',
			key: 'blog',
			value: user.blog
		}];

		cb(null, {
			user: user,
			pass: p
		});
	});

};
utils.githubToPass = githubToPass;
/*

 githubToPass('jonniespratley', function (err, user) {

 jpsPassbook.createPass(user, true, function (err, resp) {
 logger('create github pass', resp);
 });

 });*/



const AdmZip = require('adm-zip');
// reading archives
//	var zip = new AdmZip("./my_file.zip");
//var zipEntries = zip.getEntries(); // an array

utils.createZip = function(files, dest, callback) {
	var _logger = utils.getLogger('createZip');
	var zip = new AdmZip();
	if (files && files.length) {
		files.forEach(function(file) {
			_logger('addFile', file);
			zip.addLocalFile(file);
			//zip.addFile(path.basename(file), fs.readFileSync(file));

		});
	}
	// add file directly
	//zip.addFile("test.txt", new Buffer("inner content of the file"), "entry comment goes here");
	// add local file
	//zip.addLocalFile("/home/me/some_picture.png");
	// get everything as a buffer
	//var willSendthis = zip.toBuffer();
	// or write everything to disk
	zip.writeZip(dest);
	_logger('writeZip', dest);
	callback(null, dest);
}


module.exports = utils;
