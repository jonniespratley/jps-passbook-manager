'use strict';
const _ = require('lodash');
const assert = require('assert');

module.exports = function(o) {
	o = o || {};

	var profile = {
		_id: 'user-' + o.id,
		provider: '',
		id: '',
		displayName: '',
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
		data: null
	};
	if (o._json) {
		profile.data = o._json;
		delete o._json;
	}
	if (o._raw) {
		delete o._raw;
	}
	return _.assign(profile, o);
};
