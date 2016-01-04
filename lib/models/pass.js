'use strict';
const path = require('path');
const _ = require('lodash');
const config = require(path.resolve(__dirname, '../../config.json'));
module.exports = function (obj) {
	var uuid = require('node-uuid').v4();
	return _.assign({
		_id: "pass-" + uuid,
		docType: "pass",
		type: "coupon",
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
		"backgroundColor": "#ffffff",
		"coupon": {
			"primaryFields": [{
				"key": "offer",
				"label": "Any premium dog food",
				"value": "20% off"
			}],
			"auxiliaryFields": [{
				"key": "expires",
				"label": "EXPIRES",
				"value": "2 weeks"
			}],
			"backFields": [{
				"key": "terms",
				"label": "TERMS AND CONDITIONS",
				"value": "."
			}]
		}
	}, obj);
};
