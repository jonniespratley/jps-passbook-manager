'use strict';
const _ = require('lodash');
const bcrypt = require('bcrypt');
const assert = require('assert');

module.exports = function(o) {
	o = o || {};
	let id = 'user-' + (o.username || _.unique('user'));
	assert(o.username, 'has username');
	let profile = {
		_id: id,
		id: id,
		provider: null,
		displayName: null,
		username: '',
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


	let methods = {
		validPassword: function(p1) {
			console.warn('validPassword', p1, this);
			return this.password === p1;
		}
	};
	// generating a hash
	methods.generateHash = function(password) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};

	// checking if password is valid
	methods.validPassword = function(password) {
		return bcrypt.compareSync(password, this.local.password);
	};

	return _.assign(profile, o, methods);
};
