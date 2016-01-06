'use strict';
const _ = require('lodash');

module.exports = function(o) {
	o = o || {};

	if (!o.deviceLibraryIdentifier) {
		throw new Error('Must provide deviceLibraryIdentifier');
	}

	if (!o.serialNumber) {
		throw new Error('Must provide serialNumber');
	}

	let id = 'device-' + o.deviceLibraryIdentifier + '-' + o.serialNumber;
	return _.assign({
		_id: id,
		pass: null,
		deviceLibraryIdentifier: o.deviceLibraryIdentifier,
		serialNumber: o.serialNumber,
		docType: 'device',

		//Default props
		device_id: null,
		push_token: null,
		pass_type_id: null,
		serial_number: null,
		created_at: _.now(),
		updated_at: _.now(),
		type: 'registration'
	}, o);
};
