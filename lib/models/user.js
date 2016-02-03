'use strict';
const _ = require('lodash');
const bcrypt = require('bcrypt');
const assert = require('assert');

module.exports = function(o) {
	//assert(o.username, 'has username');
	assert(o.email, 'has email');
	o = o || {};
	let id = 'user-' + (o.email);

	id = id.replace(/\W/g, '-');
	let emailRegex = /@[\w\-][\w\-\.]+[a-zA-Z]{1,4}/gi;
	if (o.email) {
		o.username = o.email.replace(emailRegex, '');
	}


	let profile = {
		_id: id,
		id: id,
		provider: 'local',
		displayName: null,
		username: o.username || o.email,
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
		data: {},
		docType: 'user',
		created_at: _.now(),
		updated_at: _.now()
	};

	if (o._json) {
		profile.data = o._json;
		delete o._json;
	}

	if (o._raw) {
		delete o._raw;
	}

	let methods = {};

	methods.generateHash = function(password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};
	methods.validatePassword = function(password) {
		return bcrypt.compareSync(password, profile.password);
	};
	methods.checkPassword = function(p1, p2) {
		console.warn('checkPassword', p1, p2);
		return bcrypt.compareSync(p1, p2);
	};

	let User = _.assign(profile, o, methods);

	return User;
};
