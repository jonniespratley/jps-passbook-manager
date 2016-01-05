'use strict';
const path = require('path');
const _ = require('lodash');
const config = require(path.resolve(__dirname, '../../config.json'));

module.exports = function (obj) {
	obj = obj || {};
	var type = obj.type || 'generic';
	var passType = require(path.resolve(__dirname, '../../templates/schemas/' + type + '.json'));
	var uuid = require('node-uuid').v4();
	return _.assign({
		_id: "pass-" + uuid,
		docType: "pass",
		type: type,
		lastUpdated: Date.now().toString(),
		formatVersion: 1,
		"passTypeIdentifier": config.passkit.passTypeIdentifier,
		serialNumber: uuid,
		"teamIdentifier": config.passkit.teamIdentifier,
		"webServiceURL": config.passkit.webServiceURL,
		"authenticationToken": 'ApplePass ' + uuid,
		"barcode": {
			"message": "123456789",
			"format": "PKBarcodeFormatQR",
			"messageEncoding": "iso-8859-1"
		},
		"locations": [{
			"longitude": -122.00,
			"latitude": 37.00
		}],
		"organizationName": "JPS Coupon",
		"logoText": "JPS",
		"description": "20% off any products",
		"foregroundColor": "#000000",
		"backgroundColor": "#ffffff"
	}, passType, obj);
};
