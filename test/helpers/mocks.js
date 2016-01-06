var path = require('path');
var config = require(path.resolve(__dirname, '../../config.js'));


var Pass = require(path.resolve(__dirname, '../../lib/models/pass.js'));
var Device = require(path.resolve(__dirname, '../../lib/models/device.js'));


var mockPass = new Pass({
	type: 'generic'
});
exports.mockPass = mockPass;
exports.mockPasses = [
	new Pass({type: 'boardingPass'}),
	new Pass({type: 'coupon'}),
	new Pass({type: 'eventTicket'}),
	new Pass({type: 'generic'}),
	new Pass({type: 'storeCard'})

];

exports.mockDevice = new Device({
	deviceLibraryIdentifier: '1234567890',
	serialNumber: mockPass.serialNumber,
	passTypeIdentifier: mockPass.passTypeIdentifier
});

