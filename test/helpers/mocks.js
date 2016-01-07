var path = require('path');
var config = require(path.resolve(__dirname, '../../config.js'));


var Pass = require(path.resolve(__dirname, '../../lib/models/pass.js'));
var Device = require(path.resolve(__dirname, '../../lib/models/device.js'));


var mockPass = new Pass({
	type: 'generic'
});
exports.mockPass = mockPass;
exports.mockPasses = [
	new Pass({
		_id:'mock-boardingpass',
		type: 'boardingPass'
	}),
	new Pass({
		_id:'mock-coupon',
		type: 'coupon'
	}),
	new Pass({
		_id:'mock-eventticket',
		type: 'eventTicket'
	}),
	new Pass({
		_id:'mock-generic',
		type: 'generic'
	}),
	new Pass({
		_id:'mock-storecard',
		type: 'storeCard'
	})

];
///api/v1/v1/devices/a53ae770f6bd12d04c572e653888c6c6/registrations/pass.passbookmanager.io/25df3392-f37d-48c3-a0a1-20e9edc95f8b
const mockDevice = new Device({
	//_id: 'device-a53ae770f6bd12d04c572e653888c6c6',
	pushToken: 'ce0a5983ba7e600416d5da202cf9c218050fd424581ea259bc01174238b5a9d2',
	deviceLibraryIdentifier: '0f2cb3d59bf6435af3d3a9f1ae4460c7',
	serialNumber: mockPass.serialNumber,
	passTypeIdentifier: mockPass.passTypeIdentifier
});
exports.mockDevice = mockDevice;
