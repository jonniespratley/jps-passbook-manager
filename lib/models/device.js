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
		deviceLibraryIdentifier: o.deviceLibraryIdentifier,
		serialNumber: o.serialNumber,
		docType: 'device',
		data: o,

		//Default props
		device_id: o.deviceLibraryIdentifier,
		push_token: null,
		pass_type_id: null,
		serial_number: o.serialNumber,
		created_at: _.now(),
		updated_at: _.now(),
		type: 'registration'
	}, o);
};
