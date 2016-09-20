'use strict';
const _ = require('lodash');
//const bcrypt = require('bcrypt');
const assert = require('assert');

module.exports = function(o) {

		let profile = {
			_id: 'user-'+ Date.now(),
			id: null,
			provider: 'local',
			displayName: null,
			username: null,
			password: null,
			name: {
				familyName: null,
				givenName: null,
				middleName: null
			},
			emails: [{
				value: null,
				type: null
			}],
			photos: [],
			passTypeIdentifiers: [],
			data: {
				avatar_url:''
			},
			docType: 'user',
			created_at: _.now(),
			updated_at: _.now()
		};

	//assert(o.username, 'has username');
	//assert(o.email, 'has email');
	o = _.assign(profile, o);


	console.log('User', o)

	let id = 'user-' + (o.email);
	o.id = id;
	id = id.replace(/\W/g, '-');
	let emailRegex = /@[\w\-][\w\-\.]+[a-zA-Z]{1,4}/gi;
	if (o.email) {
		o.username = o.email.replace(emailRegex, '');
	}

	let methods = {};

	methods.generateHash = function(password) {
		return password;
	};

	methods.validatePassword = function(password) {
		return true;
	};

	methods.checkPassword = function(p1, p2) {
		return true;
	};


	if (o._json) {
		profile.data = o._json;
		delete o._json;
	}

	if (o._raw) {
		delete o._raw;
	}

	let User = _.assign(profile, o, methods);

	return User;
};
