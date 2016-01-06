'use strict';
const _ = require('lodash');

module.exports = function (o) {
	o = o || {};
	var id = 'registration-' + o.deviceLibraryIdentifier + '-' + o.serialNumber;
	return _.assign({
		_id: id,
		pass: null,
		deviceLibraryIdentifier: id,
		token: '12345',
		docType: 'device',
		type: 'registration'
	}, o);
};
