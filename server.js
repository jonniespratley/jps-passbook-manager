/**
 * @file smartpass.js
 * @comment
 * 
 * SmartPass API Module
 */
 

/**
 * Configuration Object to hold
 */
var config = {
	version: 'v1',
	security : {
		salt : 'a58e325c6df628d07a18b673a3420986'
	},
	db : {
		username : 'amadmin',
		password : 'fred',
		host : 'localhost',
		port : 27017
	}
};

// Push options
var options = {
	gateway: 'gateway.sandbox.push.apple.com',
	cert: 'pusherCert.pem',
	key: 'pushKey.pem',
	passphrase: 'fred',
	port: 2195,
	enhanced: true,
	cacheLength: 100
};


// Express server
var express = require('express');

// Express instance
var app = express();

//Configure express
app.configure(function() {
	app.use(express.logger('dev'));
	app.use("jsonp callback", true);
	app.use(express.bodyParser({
		keepExtensions : true,
		uploadDir : './temp'
	}));
	
	// error logger
	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.send(500, 'Something broke!');
	});

	// simple logger
	app.use(function(req, res, next) {
		console.log('%s %s', req.method, req.url);
		next();
	});

});



//Test device tokens
var deviceTokens = [
	'54563ea0fa550571c6ea228880c8c2c1e65914aa67489c38592838b8bfafba2a', 
	'd46ba7d730f8536209e589a3abe205b055d66d8a52642fd566ee454d0363d3f3'
];

//API Endpoint
app.get('/smartpass', function(req, res){
  var body = 'Hello World';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});

//API Version Endpoint - http://localhost:3535/smartpass/v1	
app.get('/smartpass/'+config.version, function(req, res) {
	res.json({message: 'AppMatrix Engine Apple Passbook API Server v1'});
});
 
//Register Pass Endpoint
app.post('/smartpass/'+config.version+'/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', function(req, res) {
	res.json({message: 'AppMatrix Engine Apple Passbook API Server v1'});
});

//Logging Endpoint
app.post('/smartpass/'+config.version+'/log', function(req, res) {
	console.log(req.body);
	res.json({message: 'AppMatrix Engine Apple Passbook API Server v1'});
});

//Unregister Pass
app.delete('/smartpass/'+config.version+'/devices/:deviceLibraryIdentifier/:passTypeIdentifier/:serialNumber', function(req, res) {
	res.json({message: 'AppMatrix Engine Apple Passbook API Server v1'});
});

//Register device
app.get('/smartpass/'+config.version+'/register/:token', function(req, res){

	console.log('Register device ' + req.param('token'));
});

//Get serial numbers
app.get('/smartpass/'+config.version+'/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier', function(req, res){

	console.log('Push to device ' + req.param('token'));
});

//Get latest version of pass
app.get('/smartpass/'+config.version+'/passes/:passTypeIdentifier/:serialNumber', function(req, res){

	console.log('Push to device ' + req.param('token'));
});

//Send push to device
app.get('/smartpass/'+config.version+'/push/:token', function(req, res){
	console.log('Push to device ' + req.param('token'));
});

//Export to public api
exports.smartpass = {
	app : app,
	express : express,
	init : function(port) {
		app.listen(port);
		console.log('SmartPass Server Listening on port ' + port);
	}
};


