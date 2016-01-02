var express = require('express'),
	bodyParser = require('body-parser'),
	jsonParser = bodyParser.json();

var jpsPassbook = require('./jps-passbook');
var serveStatic = require('serve-static');

var path = require('path');
var fs = require('fs');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var assert = require('assert');
var sys = require('sys')
var exec = require('child_process').exec;


/**
 * Passbook Routes - This file contains the API routes needed for Passbook and Passbook Manager
 * @example
 *

 var app = express();
 require(__dirname + path.sep + 'routes'+ path.sep +'jps-passbook-routes')(config, app);


 //Start the server
 app.listen(config.server.port, function () {
	console.log(config.message + ' running @: ' + config.server.host + ':' + config.server.port);
 });

 * @param config
 * @param app
 */
module.exports = function (program, app) {

	if (!app) {
		throw new Error('Must provide an express app as argument 2');
	}

	var config = program.config.defaults;
	var router = express.Router();
	//var RestResource = require('./rest-resource')(config);

	/**
	 * RESTful METHODS:
	 *
	 * HTTP     METHOD          URL
	 * ======|==============|==============================================
	 * GET      findAll         http://localhost:4040/passbookmanager
	 * GET      findById        http://localhost:4040/passbookmanager/passes/:id
	 * POST     add             http://localhost:4040/passbookmanager/passes
	 * PUT      update          http://localhost:4040/passbookmanager/passes/:id
	 * DELETE   destroy         http://localhost:4040/passbookmanager/passes/:id
	 */
	app.route('/:db/:id?', bodyParser.json())
		.all(function (req, res, next) {
			// runs for all HTTP verbs first
			// think of it as route specific middleware!
			program.log('debug', req.method + ' ' + req.url);
			next();
		})
		.get(function (req, res, next) {
			//res.json(...);
			next();
		})
		.post(function (req, res, next) {
			// maybe add a new event...
			next();
		});


	app.get('/' + config.name, function (req, res, next) {
		res.status(200).json(config);
	});
	app.get('/:db/:id?', function (req, res, next) {
		program.db.get(req.params.id, req.params).then(function (resp) {
			res.status(200).json(resp);
		}).catch(function (err) {
			res.status(400).json(err);
		});
	});
	app.get('/:db?', function (req, res, next) {
		program.db.allDocs(req.query).then(function (resp) {
			res.status(200).json(resp);
		}).catch(function (err) {
			res.status(400).json(err);
		});
	});
	app.post('/:db', bodyParser.json(), function (req, res, next) {

	});
	app.put('/:db/:id', bodyParser.json(), function (req, res, next) {
		program.db.put(req.body, req.params.id, req.query.rev).then(function (resp) {
			res.status(200).json(resp);
		}).catch(function (err) {
			res.status(400).json(err);
		});
	});
	app.delete('/:db/:id', function (req, res, next) {
		program.db.remove(req.param.id, req.query.rev).then(function (resp) {
			res.status(200).json(resp);
		}).catch(function (err) {
			res.status(400).json(err);
		});
	});


	/* ======================[ @TODO: Listen for Device registration token ]====================== */

	//### onError()
	//callback handler
	var onError = function (error, note) {
		program.log('Error is: %s', error);
		program.log('Note ' + note);
	};

	//Test device tokens
	var deviceTokens = [
		'54563ea0fa550571c6ea228880c8c2c1e65914aa67489c38592838b8bfafba2a',
		'd46ba7d730f8536209e589a3abe205b055d66d8a52642fd566ee454d0363d3f3'
	];


	//API Version Endpoint - http://localhost:3535/smartpass/v1
	router.get('/', function (req, res) {
		res.status(200).json({
			message: config.name
		});
	});

	//Register Pass Endpoint
	/*

	 https://developer.apple.com/library/ios/documentation/PassKit/Reference/PassKit_WebService/WebService.html
	* Registering a Device to Receive Push Notifications for a Pass

	 POST request to webServiceURL/version/devices/deviceLibraryIdentifier/registrations/passTypeIdentifier/serialNumber

	 Parameters

	 webServiceURL
	 The URL to your web service, as specified in the pass.
	 version
	 The protocol version—currently, v1.
	 deviceLibraryIdentifier
	 A unique identifier that is used to identify and authenticate this device in future requests.
	 passTypeIdentifier
	 The pass’s type, as specified in the pass.
	 serialNumber
	 The pass’s serial number, as specified in the pass.
	 Header

	 The Authorization header is supplied; its value is the word ApplePass, followed by a space, followed by the pass’s authorization token as specified in the pass.

	 Payload

	 The POST payload is a JSON dictionary containing a single key and value:

	 pushToken
	 The push token that the server can use to send push notifications to this device.
	 Response

	 If the serial number is already registered for this device, returns HTTP status 200.
	 If registration succeeds, returns HTTP status 201.
	 If the request is not authorized, returns HTTP status 401.
	 Otherwise, returns the appropriate standard HTTP status.
	* */
	router.post('/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber',
		function (req, res) {
			res.status(200).json({
				message: 'Register pass on device'
			});
		});


	router.post('/log', bodyParser.json(), function (req, res) {
		res.status(200).json({
			message: 'save logs'
		});
	});

	//Unregister Pass
	router.delete('/devices/:deviceLibraryIdentifier/:passTypeIdentifier/:serialNumber',
		function (req, res) {
			program.log('Register device ' + req.param('token'));
			res.status(200).send({
				message: config.name + ' - ' + 'Delete device ' + req.param('token')
			});
		});

	//Register device
	router.get('/register/:token', function (req, res) {
		program.log('Register device ' + req.param('token'));
		res.json({
			message: config.name + ' - ' + 'Register device ' + req.param('token')
		});
	});
	router.get('/push/:token', function (req, res) {
		program.log('Register device ' + req.param('token'));
		res.json({
			message: config.name + ' - ' + 'Register device ' + req.param('token')
		});
	});

	//Get serial numbers
	router.get('/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier?',
		function (req, res) {
			program.log('Push to device ' + req.param('token'));
			res.status(200).send({
				lastUpdated: '',
				serialNumbers:[],
				message: config.name + ' - ' + 'Push to device ' + req.param('token')
			});
		});

	//Get latest version of pass
	router.get('/passes/:passTypeIdentifier/:serialNumber', function (req, res) {
		program.log('Push to device ' + req.param('token'));
		res.status(200).send({
			message: 'Get latest version of ' + req.params.passTypeIdentifier
		});
	});

	//Send push to device
	router.get('/devices/:deviceLibraryIdentifier/push/:token', function (req, res) {
		program.log('Push to device ' + req.param('token'));
		res.status(200).send({
			message: 'Device push token'
		});
	});


	/**
	 * I am the signpass route
	 */
	router.get('/sign/:id', function (req, res) {
		var passFile = req.param('path');
		if (passFile) {
			jpsPassbook.sign(passFile, function (data) {
				//res.status(200).send({message: passFile + ' signed.', filename: data});

				res.set('Content-Type', 'application/vnd.apple.pkpass').status(200).download(
					data);
			});
		} else {
			res.status(400).send({
				message: 'Must provide path to .raw folder!'
			});
		}
	});

	/**
	 * I am the export pass route.
	 *
	 * I handle taking a pass's id, quering the database,
	 * taking the contents of the pass and invoking the createPass method which
	 * creates a .raw folder containing a pass.json file and then invokes the
	 * signpass binary.
	 */
	router.get('/export/:id', function (req, res) {
		var id = req.params.id;
		if (id) {
			program.log('id', id);
			program.db.get(id).then(function (resp) {
				program.log('found pass', resp);
				jpsPassbook.createPass(config.publicDir, resp, function (data) {
					res.status(200).send(data);
				});
			}).catch(function (err) {
				res.status(404).send(err);
			});
		} else {
			res.status(400).send('Must provide file path!');
		}
	});


	app.use(serveStatic('../app', null));
	app.use(serveStatic('../www', null));

	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		res.header('Access-Control-Allow-Methods',
			'GET,PUT,POST,DELETE,PATCH,HEAD,CONNECT');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Cache-Control', 'no-cache');


		program.log('%s %s', req.method, req.url);
		next();
	});

	app.use(function (err, req, res, next) {
		console.error(err.stack);
		res.status(500).send('Something broke!');
	});


	app.use('/api/' + config.version, router);

	program.log('info', 'jps-passbook-routes initialized');
};
