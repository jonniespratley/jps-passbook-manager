'use strict';
var path = require('path');
var log = require('npmlog');
var config = require(path.resolve(__dirname, '../../config.js'));
var program = require(path.resolve(__dirname, '../../lib/program.js'))({
	dataPath: path.resolve(__dirname, '../temp')
});


var Pass = require(path.resolve(__dirname, '../../lib/models/pass.js'));
var Passes = require(path.resolve(__dirname, '../../lib/models/passes.js'));
var Device = require(path.resolve(__dirname, '../../lib/models/device.js'));

exports.mockIdentifer = {
	passTypeIdentifier: config.passkit.passTypeIdentifier,
	wwdr: path.resolve(__dirname, '../../certificates/wwdr-authority.pem'),
	p12: path.resolve(__dirname, `../../certificates/${config.passkit.passTypeIdentifier}.p12`),
	passphrase: 'test'
};

var authToken = '0123456789876543210';


log.info('mock-program', 'config', program.config.defaults);

log.info('passTypeIdentifier', config.passkit.passTypeIdentifier);
exports.program = program;

exports.mockPasses = [

	new Pass({
		serialNumber: 'mock-generic',
		description: 'Example Generic',
		authenticationToken: authToken,
		type: 'generic'
	}),

	new Pass({
		serialNumber: 'mock-boarding',
		description: 'Example Boarding Pass',
		authenticationToken: authToken,
		type: 'boardingPass'
	}),

	new Pass({
		serialNumber: 'mock-coupon',
authenticationToken: authToken,
		description: 'Example Coupon',
		type: 'coupon'
	}),

	new Pass({
		serialNumber: 'mock-eventticket',
		authenticationToken: authToken,
		description: 'Example Event Ticket',
		type: 'eventTicket'
	}),

	new Pass({
		serialNumber: 'mock-storecard',
		authenticationToken: authToken,
		description: 'Example Store Card',
		type: 'storeCard'
	}),
	new Pass({
		serialNumber: 'mock-github',
		authenticationToken: authToken,
		description: 'Example Github',
		type: 'github'
	})
];

exports.mockPass = exports.mockPasses[0];

///api/v1/v1/devices/a53ae770f6bd12d04c572e653888c6c6/registrations/pass.passbookmanager.io/25df3392-f37d-48c3-a0a1-20e9edc95f8b
exports.mockDevice = new Device({
	//_id: 'device-a53ae770f6bd12d04c572e653888c6c6',
	pushToken: 'ce0a5983ba7e600416d5da202cf9c218050fd424581ea259bc01174238b5a9d2',
	deviceLibraryIdentifier: '1234567890',
	serialNumber: '0123456789876543210',
	authorization: 'ApplePass ' + authToken,
	passTypeIdentifier: exports.mockPass.passTypeIdentifier
});
