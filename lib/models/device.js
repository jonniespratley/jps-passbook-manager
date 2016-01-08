'use strict';
const _ = require('lodash');

module.exports = function(o) {
	o = o || {};

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
		type: 'registration'
	}, o);
};
