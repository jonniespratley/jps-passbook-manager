var path = require('path');
var config = require(path.resolve(__dirname, '../../config.json'));


var Pass = require(path.resolve(__dirname, '../../lib/models/pass.js'));

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
	"type" : "device"
};

exports.mockPass = new Pass({
	webServiceURL: config.passkit.webServiceURL,
	passTypeIdentifier: config.passkit.passTypeIdentifier,
	teamIdentifier: config.passkit.teamIdentifier
});