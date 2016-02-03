'use strict';
const request = require('request');
const path = require('path');
const crypto = require('crypto');
const pkg = require(path.resolve(__dirname, '../package.json'));
const debug = require('debug');

var utils = {};


utils.getLogger = function(name) {
	return debug(pkg.name + ':' + name);
};

var logger = utils.getLogger('utils');


function checksum(str, algorithm, encoding) {
	return crypto
		.createHash(algorithm || 'md5')
		.update(str, 'utf8')
		.digest(encoding || 'hex');
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

		var user = JSON.parse(body);
		//	console.log(user);
		logger('githubToPass', 'response', user);
		var p = new Pass({
			_id: 'pass-' + user.login,
			type: 'github',
			generic: {}
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

		cb(error, {
			user: user,
			pass: p
		});
	});

};
utils.githubToPass = githubToPass;


module.exports = utils;
