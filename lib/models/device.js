'use strict';
const _ = require('lodash');
const assert = require('assert');
module.exports = function(o) {
	o = o || {};
	assert(o.deviceLibraryIdentifier, 'has device id');
	if (!o.deviceLibraryIdentifier) {
		throw new Error('Must provide deviceLibraryIdentifier');
	}

	let id = 'device-' + o.deviceLibraryIdentifier;
	return _.assign({
		_id: id,
		pushToken: o.pushToken,
		deviceLibraryIdentifier: o.deviceLibraryIdentifier,
		docType: 'device',
		created_at: _.now(),
		updated_at: _.now(),
		type: 'device'
	}, o);
};
