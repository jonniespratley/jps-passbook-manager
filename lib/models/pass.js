'use strict';
const path = require('path');
const _ = require('lodash');
const config = require(path.resolve(__dirname, '../../config.js'));

module.exports = function(obj) {
	obj = obj || {};
	let type = obj.type || 'generic';
	let passType = require(path.resolve(__dirname, '../../templates/schemas/' + type + '.json'));
	let uuid = require('node-uuid').v4();
	return _.assign({
			_id: "pass-" + uuid,
			docType: "pass",
			type: type,
			lastUpdated: _.now(),
			"authenticationToken": uuid,
			serialNumber: uuid,
			formatVersion: 1,
			"barcode": {
				"message": "123456789",
				"format": "PKBarcodeFormatQR",
				"messageEncoding": "iso-8859-1"
			},
			"locations": [{
				"longitude": -122.00,
				"latitude": 37.00
			}],
			"organizationName": "Passbook Manager",
			"logoText": "Passbook Manager",
			"description": "This is the default pass description.",

			foregroundColor: "rgb(72, 72, 72)",
			backgroundColor: "rgb(183, 180, 183)",

			//File locations
			filename: null,
			pkpassFilename: null,
			rawFilename: null
		},
		passType,
		obj, {
			"passTypeIdentifier": config.passkit.passTypeIdentifier,
			"teamIdentifier": config.passkit.teamIdentifier,
			"webServiceURL": config.passkit.webServiceURL
		});
};
