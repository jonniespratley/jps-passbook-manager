'use strict';
const path = require('path');
const _ = require('lodash');
const config = require(path.resolve(__dirname, '../../config.js'));

module.exports = function(obj) {
	obj = obj || {};
	let type = obj.type || 'generic';
	let passType = require(path.resolve(__dirname, '../../templates/schemas/' + type + '.json'));
	let uuid = require('node-uuid').v4() || obj.serialNumber;

	_.assign(this, {
			_id: "pass-" + uuid,


			docType: "pass",
			type: type,

			// TODO: Standard keys - Information that is required for all passes.
			lastUpdated: _.now(),
			"logoText": "Passbook Manager",
			"description": "This is the default pass description.",
			formatVersion: 1,
			"organizationName": "Passbook Manager",
			"passTypeIdentifier": config.passkit.passTypeIdentifier,
			serialNumber: uuid,
			"teamIdentifier": config.passkit.teamIdentifier,

			//web service keys
			"authenticationToken": uuid,
			"webServiceURL": config.passkit.webServiceURL,

			// TODO: expiration keys - Information about when a pass expires and whether it is still valid.
			/*expirationDate: null,
			 */
			voided: false,

			//Apple pay keys
			/*	nfc: [
					{
						message: '',
						encryptionPublicKey: ''
					}
				],*/
			"barcode": {
				"message": "123456789",
				"format": "PKBarcodeFormatQR",
				"messageEncoding": "iso-8859-1"
			},

			// TODO: Relevance keys
			beacons: [
				/* [{
								major: null,
								minor: null,
								proximityUUID: '',
								relevantText: ''
							}]*/
			],

			locations: [{
				"longitude": -122.00,
				"latitude": 37.00,
				//	altitude: null,
				relevantText: 'Nearby'
			}],

			maxDistance: 0,
			/*
			relevantDate: '',
		w3c date string*/

			//Visual apperance
			barcodes: [],
			groupingIdentifier: '',

			labelColor: 'rgb(0, 0, 0)',
			foregroundColor: "rgb(72, 72, 72)",
			backgroundColor: "rgb(183, 180, 183)",
			suppressStripShine: false,

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
