'use strict';
const _ = require('lodash');
const assert = require('assert');

module.exports = function(o) {
	o = o || {};
	var profile = {
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
		photos: []

	};
	return _.assign(profile, o);
};
