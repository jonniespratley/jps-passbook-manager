/**
 * @author Jonnie Spratley, AppMatrix
 * @created 02/26/13
 */
//## Dependencies
var express = require('express'),
	bodyParser = require('body-parser'),
	jsonParser = bodyParser.json();
var path = require('path');


var port = process.env.PORT || 1333;
var host = process.env.VCAP_APP_HOST || "127.0.0.1";

var cloudServices = null;
var dbcreds = null;
var dbconn = null;

//Configuration Object to hold settings for server

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



if(process.env.MONGODB_URL){
	config.db.url = process.env.MONGODB_URL;
	console.warn('changing mongodb url', process.env.MONGODB_URL);
}

require(__dirname + path.sep + 'routes/jps-passbook-routes')(config, app);
require(__dirname + path.sep + 'routes/rest-resource-routes')(config, app);

//Start the server
app.listen(config.server.port, function () {
	console.log(config.message + ' running @: ' + config.server.host + ':' + config.server.port);
});
