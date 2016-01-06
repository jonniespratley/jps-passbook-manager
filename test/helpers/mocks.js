var path = require('path');
var config = require(path.resolve(__dirname, '../../config.js'));


var Pass = require(path.resolve(__dirname, '../../lib/models/pass.js'));
var Device = require(path.resolve(__dirname, '../../lib/models/device.js'));

exports.mockPasses = [
	new Pass({type: 'boardingPass'}),
	new Pass({type: 'coupon'}),
	new Pass({type: 'eventTicket'}),
	new Pass({type: 'generic'}),
	new Pass({type: 'storeCard'})

];

exports.mockDevice = new Device();
exports.mockPass = new Pass({
	type: 'generic'
});
