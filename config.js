'use strict';

//TODO - Change to your values
const APPLE_TEAM_IDENTIFIER = 'USE9YUYDFH';
const APPLE_PASS_TYPE_IDENTIFIER = 'pass.passbookmanager.io';
const APPLE_WEB_SERVICE_URL = 'https://passbook-manager.run.aws-usw02-pr.ice.predix.io/api/v1';



var config = {
	"name": "passbookmanager",
	"message": "Passbook Manager API Server",
	"version": "v1",
	"dataPath": "./data",
	"passkit": {
		"teamIdentifier": APPLE_TEAM_IDENTIFIER,
		"passTypeIdentifier": APPLE_PASS_TYPE_IDENTIFIER,
		"webServiceURL": APPLE_WEB_SERVICE_URL
	},
	"security": {
		"salt": "a58e325c6df628d07a18b673a3420986"
	},
	"server": {
		"host": "localhost",
		"port": 5001
	},
	"db": {
		"local": "passbookmanager",
		"remote": "http://localhost:5984/passbookmanager"
	},
	"collections": [
		"devices",
		"passes",
		"notifications",
		"settings"
	],
	"staticDir": "./app",
	"publicDir": "./www",
	"uploadsTmpDir": "./.tmp",
	"uploadsDestDir": "./www"
};

module.exports = config;
