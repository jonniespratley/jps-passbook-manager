'use strict';
const _ = require('lodash');

module.exports = function (o) {
	o = o || {};
	if(o.deviceLibraryIdentifier){
		throw new Error('Must provide deviceLibraryIdentifier');
	}

	if(o.serialNumber){
		throw new Error('Must provide serialNumber');
	}

	var id = 'registration-' + o.deviceLibraryIdentifier + '-' + o.serialNumber;
	return _.assign({
		_id: id,
		pass: null,
		deviceLibraryIdentifier: o.deviceLibraryIdentifier,
		serialNumber: o.serialNumber,

		docType: 'device',
		type: 'registration'
	}, o);
};
