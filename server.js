/**
 * @author Jonnie Spratley, AppMatrix
 * @created 02/26/13
 */
//## Dependencies
var express = require('express'), path = require('path'), fs = require('fs-extra');

var port = process.env.PORT || 1333;
var host = process.env.VCAP_APP_HOST || "127.0.0.1";
var config = fs.readJsonSync(__dirname + path.sep + 'config' + path.sep + 'config.json');

if(process.env.MONGODB_URL){
	config.db.url = process.env.MONGODB_URL;
	console.warn('changing mongodb url', process.env.MONGODB_URL);
}

var app = express();
require(__dirname + path.sep + 'routes'+ path.sep +'jps-passbook-routes')(config, app);


//Start the server
app.listen(port, function () {
	console.log(config.message + ' running @: ' + host + ':' + port);
});
