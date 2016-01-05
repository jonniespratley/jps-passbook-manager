var path = require('path');
var config = require(path.resolve(__dirname, '../../config.js'));


var Pass = require(path.resolve(__dirname, '../../lib/models/pass.js'));

exports.mockPasses = [
	new Pass({type: 'boardingPass'}),
	new Pass({type: 'coupon'}),
	new Pass({type: 'eventTicket'}),
	new Pass({type: 'generic'}),
	new Pass({type: 'storeCard'})

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
