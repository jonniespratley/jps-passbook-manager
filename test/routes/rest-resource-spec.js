
var assert = require('assert'), path = require('path'), fs = require('fs-utils'), os = require('os');


var jpsPassbook = require(path.resolve(__dirname, '../../routes/jps-passbook'));



//mongodb://admin:admin@ds031611.mongolab.com:31611/passbookmanager
var config = {
	name: 'passbookmanager',
	message: 'Passbook Manager API Server',
	version: 'v1',
	security: {
		salt: 'a58e325c6df628d07a18b673a3420986'
	},
	server: {
		host: host,
		port: port
	},
	db: {
		username: 'demouser',
		password: 'demopassword',
		host: 'ds031611.mongolab.com',
		port: 31611,

		url: 'mongodb://localhost:27017'
	},
	collections: ['devices', 'passes', 'notifications', 'settings'],
	staticDir: './app',
	publicDir: __dirname + path.sep + 'www/public',
	uploadsTmpDir: __dirname + path.sep + '.tmp',
	uploadsDestDir: __dirname + path.sep + 'www/public'
};


//Initialize the REST resource server with our configuration object.

var app = express();

