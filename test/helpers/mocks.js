var path = require('path');
var config = require(path.resolve(__dirname, '../../config.json'));



exports.mockPasses = [
	require(path.resolve(__dirname, '../../templates/schemas/boardingPass.json')),
	require(path.resolve(__dirname, '../../templates/schemas/coupon.json')),
	require(path.resolve(__dirname, '../../templates/schemas/eventTicket.json')),
	require(path.resolve(__dirname, '../../templates/schemas/generic.json')),
	require(path.resolve(__dirname, '../../templates/schemas/storeCard.json'))
];

exports.mockDevice = {
	_id: "device-" + require('node-uuid').v4(),
	deviceLibraryIdentifier: 'device-lib-123456789',
	token: '12345',
	"docType": "device",
	"type" : "device",
};

var uuid = require('node-uuid').v4();

exports.mockPass = {
	_id: "pass-" + uuid,
	"docType": "pass",
	"type" : "coupon",
	"lastUpdated": new Date().toString(),
	"formatVersion": 1,
	"passTypeIdentifier": "pass.passbookmanager.io",
	"serialNumber": uuid,
	"teamIdentifier": config.passkit.teamIdentifier,
	"webServiceURL": config.passkit.webServiceURL,
	"authenticationToken": "QXBwbGVQYXNzIDAwMDAwMDAwMDAxMjM0",
	"barcode": {
		"message": "123456789",
		"format": "PKBarcodeFormatQR",
		"messageEncoding": "iso-8859-1"
	},
	"locations": [{
		"longitude": -122.3748889,
		"latitude": 37.6189722
	}],
	"organizationName": "JPS Coupon",
	"logoText": "JPS",
	"description": "20% off any products",
	"foregroundColor": "#000000",
	"backgroundColor": "#ffffff",
	"coupon": {
		"primaryFields": [
			{
				"key": "offer",
				"label": "Any premium dog food",
				"value": "20% off"
			}
		],
		"auxiliaryFields": [
			{
				"key": "expires",
				"label": "EXPIRES",
				"value": "2 weeks"
			}
		],
		"backFields": [
			{
				"key": "terms",
				"label": "TERMS AND CONDITIONS",
				"value": "Generico offers this pass, including all information, software, products and services available from this pass or offered as part of or in conjunction with this pass (the \"pass\"), to you, the user, conditioned upon your acceptance of all of the terms, conditions, policies and notices stated here. Generico reserves the right to make changes to these Terms and Conditions immediately by posting the changed Terms and Conditions in this location.\n\nUse the pass at your own risk. This pass is provided to you \"as is,\" without warranty of any kind either express or implied. Neither Generico nor its employees, agents, third-party information providers, merchants, licensors or the like warrant that the pass or its operation will be accurate, reliable, uninterrupted or error-free. No agent or representative has the authority to create any warranty regarding the pass on behalf of Generico. Generico reserves the right to change or discontinue at any time any aspect or feature of the pass."
			}
		]
	}
};
