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

const SignPass = require('./lib/signpass')();

var output_url = './tmp';
var wwdr_url = './certificates/wwdr-authority.pem';
var cert_url = './certificates/passbookmanager-cert.p12';
var cert_pass = 'fred';
var pass_url = '/Users/jps/Github/jps-passbook-manager/data/passes/1d6d844b-77ea-47b2-9414-2e9d0ea414f5.raw';
var signpass = new SignPass(pass_url, cert_url, cert_pass, output_url);

signpass.sign_pass();



var logger = utils.getLogger('scratch');
/**
 * I take a github username and fetch the user info
 * and return a pss object.
 * @param username
 */
var githubToPass = function(username, cb) {
	let github = {};
	let pass = new Pass({
		description: null
	});

	var options = {
		method: 'GET',
		url: 'https://api.github.com/users/' + username,
		headers: {
			'User-Agent': 'jps-passbook-manager',
			'content-type': 'application/json'
		}
	};

	logger( 'githubToPass', 'request', options.method, options.url);
	request(options, function(error, response, body) {

		logger( 'githubToPass', 'response', body);
		if (error) {
			throw new Error(error);
		}
		cb(JSON.parse(body));
	});

};



githubToPass('jonniespratley', function(user) {
	//	console.log(user);

	var p = new Pass({
		_id: 'pass-' + user.login,
		type: 'generic'
	});

	p.description = `${user.name} Github`;
	p.logoText = 'Github';
	p.organizationName = user.company;

	p.generic.primaryFields = [{
		key: 'Name',
		value: user.name
	}];

	p.generic.secondaryFields = [{
		key: 'username',
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

	p.generic.backFields = [{
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



	jpsPassbook.createPass(p, true, function(resp) {
		logger('create github pass', resp);
	});

});
