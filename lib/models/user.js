'use strict';
const _ = require('lodash');
const assert = require('assert');

module.exports = function(o) {
	o = o || {};

	assert(o.username, 'has username');
	var profile = {
		_id: 'user-' + o.username,
		provider: '',
		id: '',
		displayName: '',
		username: '',
		password: '',
		name: {
			familyName: '',
			givenName: '',
			middleName: ''
		},
		emails: [{
			value: '',
			type: ''
		}],
		photos: [],
		passTypeIdentifiers: [],
		data: null
	};
	if (o._json) {
		profile.data = o._json;
		delete o._json;
	}
	if (o._raw) {
		delete o._raw;
	}

	var methods = {
		validPassword: function(p1) {
			console.warn('validPassword', p1, this);
			return this.password === p1;
		}
	};
	return _.assign(profile, o, methods);
};
