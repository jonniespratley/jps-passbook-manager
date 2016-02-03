'use strict';
const request = require('request');
const crypto = require('crypto');
module.exports = function (Pass, pkg) {

	class Utils {
		checksum(str, algorithm, encoding) {
			return crypto
				.createHash(algorithm || 'md5')
				.update(str, 'utf8')
				.digest(encoding || 'hex');
		}

		/**
		 * I take a github username and fetch the user info
		 * and return a pss object.
		 * @param username
		 */
		githubToPass(username, cb) {
			let options = {
				method: 'GET',
				url: 'https://api.github.com/users/' + username,
				tunnel: true,
				headers: {
					'User-Agent': 'jps-passbook-manager',
					'content-type': 'application/json'
				}
			};

			let user = {};
			let p = null;

			request(options, function (error, response, body) {
				try {
					user = JSON.parse(body);
				} catch (err) {
					console.error('Error parsing response body', body);
				}

				p = new Pass({
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
		}
	}

	return new Utils();
};
