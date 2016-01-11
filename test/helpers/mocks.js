'use strict';
var path = require('path');
var config = require(path.resolve(__dirname, '../../config.js'));
var program = require(path.resolve(__dirname, '../../lib/program.js'))({
	dataPath: path.resolve(__dirname, '../temp')
});
exports.program = program;

var Pass = require(path.resolve(__dirname, '../../lib/models/pass.js'));
var Passes = require(path.resolve(__dirname, '../../lib/models/passes.js'));
var Device = require(path.resolve(__dirname, '../../lib/models/device.js'));

var mockPass = new Pass({
	type: 'generic',
	serialNumber: '123456789',
	authenticationToken: '123456789'
});

exports.mockPass = mockPass;
exports.mockPasses = [
	mockPass,
	new Pass({
		_id: 'mock-boardingpass',
		type: 'boardingPass'
	}),
	new Pass({
		_id: 'mock-coupon',
		type: 'coupon'
	}),
	new Pass({
		_id: 'mock-eventticket',
		type: 'eventTicket'
	}),
	new Pass({
		_id: 'mock-generic',
		type: 'generic'
	}),
	new Pass({
		_id: 'mock-storecard',
		type: 'storeCard'
	})

];
///api/v1/v1/devices/a53ae770f6bd12d04c572e653888c6c6/registrations/pass.passbookmanager.io/25df3392-f37d-48c3-a0a1-20e9edc95f8b
const mockDevice = new Device({
	//_id: 'device-a53ae770f6bd12d04c572e653888c6c6',
	pushToken: 'ce0a5983ba7e600416d5da202cf9c218050fd424581ea259bc01174238b5a9d2',
	deviceLibraryIdentifier: '1234567890',
	serialNumber: '123456789',
	authorization: 'ApplePass 123456789',
	passTypeIdentifier: mockPass.passTypeIdentifier
});
exports.mockDevice = mockDevice;

exports.github = {
	"login": "jonniespratley",
	"id": 320490,
	"avatar_url": "https://avatars.githubusercontent.com/u/320490?v=3",
	"gravatar_id": "",
	"url": "https://api.github.com/users/jonniespratley",
	"html_url": "https://github.com/jonniespratley",
	"followers_url": "https://api.github.com/users/jonniespratley/followers",
	"following_url": "https://api.github.com/users/jonniespratley/following{/other_user}",
	"gists_url": "https://api.github.com/users/jonniespratley/gists{/gist_id}",
	"starred_url": "https://api.github.com/users/jonniespratley/starred{/owner}{/repo}",
	"subscriptions_url": "https://api.github.com/users/jonniespratley/subscriptions",
	"organizations_url": "https://api.github.com/users/jonniespratley/orgs",
	"repos_url": "https://api.github.com/users/jonniespratley/repos",
	"events_url": "https://api.github.com/users/jonniespratley/events{/privacy}",
	"received_events_url": "https://api.github.com/users/jonniespratley/received_events",
	"type": "User",
	"site_admin": false,
	"name": "Jonnie Spratley",
	"company": "GE Digital (Predix Platform)",
	"blog": "http://jonniespratley.me",
	"location": "East Bay, CA",
	"email": "jonniespratley@me.com",
	"hireable": null,
	"bio": null,
	"public_repos": 81,
	"public_gists": 7,
	"followers": 32,
	"following": 5,
	"created_at": "2010-07-01T20:42:16Z",
	"updated_at": "2016-01-01T18:31:44Z"
};


/**
 * I take a github username and fetch the user info
 * and return a pss object.
 * @param username
 */
exports.githubToPass = function(username) {
	let github = {};
	let pass = new Pass({
		description: null
	});

	var http = require("https");

	var options = {
		"method": "GET",
		"hostname": "api.github.com",
		"path": "/users/" + username,
		"headers": {
			"content-type": "application/json"
		}
	};

	var req = http.request(options, function(res) {
		var chunks = [];

		res.on("data", function(chunk) {
			chunks.push(chunk);
		});

		res.on("end", function() {
			var body = Buffer.concat(chunks);
			console.log(body.toString());
		});
	});

	req.end();
};
