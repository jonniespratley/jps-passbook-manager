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
module.exports = function(program, app) {
	if (!program) {
		throw new Error('Must provide a program as argument 1');
	}
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
	app.route('/api/' + config.version + '/:db/:id?', bodyParser.json())
		.all(function(req, res, next) {
			// runs for all HTTP verbs first
			// think of it as route specific middleware!
			program.log.log('debug',req.method + ' ' + req.url);
			next();
		})
		.get(function(req, res, next) {
			//res.json(...);
			next();
		})
		.post(function(req, res, next) {
			// maybe add a new event...
			next();
		});



	app.get('/api/' + config.version + '/' + config.name, function(req, res, next) {
		res.status(200).json(config);
	});
	app.get('/api/' + config.version + '/:db/:id?', function(req, res, next) {
		program.db.get(req.params.id, req.params).then(function(resp) {
			res.status(200).json(resp);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});
	app.get('/api/' + config.version + '/:db?', function(req, res, next) {
		program.db.allDocs(req.query).then(function(resp) {
			res.status(200).json(resp);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});
	app.post('/api/' + config.version + '/:db', bodyParser.json(), function(req, res, next) {

	});
	app.put('/api/' + config.version + '/:db/:id', bodyParser.json(), function(req, res, next) {
		program.db.put(req.body, req.params.id, req.query.rev).then(function(resp) {
			res.status(200).json(resp);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});
	app.delete('/api/' + config.version + '/:db/:id', function(req, res, next) {
		program.db.remove(req.params.id, req.query.rev).then(function(resp) {
			res.status(200).json(resp);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});


	/* ======================[ @TODO: Listen for Device registration token ]====================== */

	//### onError()
	//callback handler
	var onError = function(error, note) {
		console.log('Error is: %s', error);
		console.log('Note ' + note);
	};

	//Test device tokens
	var deviceTokens = [
		'54563ea0fa550571c6ea228880c8c2c1e65914aa67489c38592838b8bfafba2a',
		'd46ba7d730f8536209e589a3abe205b055d66d8a52642fd566ee454d0363d3f3'
	];

	//API Endpoint
	router.get('/api', function(req, res) {
		res.setHeader('Content-Type', 'text/plain');
		//res.setHeader('Content-Length', body.length);
		res.status(200).json({
			message: 'Welcome to api'
		});
	});

	//Execute command - http://localhost:4040/api/v1/cmd/ls
	router.get('/api/' + 'cmd' + '/' + ':command',
		function(req, res) {
			var results = {},
				child;
			child = exec(req.params.command, function(error, stdout, stderr) {
				results.stdout = stdout;
				sys.print('stdout: ' + stdout);
				if (error !== null) {
					console.log('exec error: ' + error);
				}

				res.status(200).json({
					message: config.name,
					results: results
				});
			});
		});

	//API Version Endpoint - http://localhost:3535/smartpass/v1
	router.get('/api', function(req, res) {
		res.status(200).json({
			message: config.name
		});
	});

	//Register Pass Endpoint
	router.post('/api/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber',
		function(req, res) {
			res.status(200).json({
				message: 'Register pass on device'
			});
		});

	//Logging Endpoint
	router.get('/api/log', function(req, res) {
		res.status(200).json({
			message: 'Drain logs'
		});
	});
	router.post('/api/log', function(req, res) {
		res.status(200).json({
			message: 'Drain logs'
		});
	});

	//Unregister Pass
	router.delete('/api/devices/:deviceLibraryIdentifier/:passTypeIdentifier/:serialNumber',
		function(req, res) {
			console.log('Register device ' + req.param('token'));
			res.status(200).send({
				message: config.name + ' - ' + 'Delete device ' + req.param('token')
			});
		});

	//Register device
	router.get('/api/register/:token', function(req, res) {
		console.log('Register device ' + req.param('token'));
		res.json({
			message: config.name + ' - ' + 'Register device ' + req.param('token')
		});
	});

	//Get serial numbers
	router.get('/api/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier',
		function(req, res) {
			console.log('Push to device ' + req.param('token'));
			res.status(200).send({
				message: config.name + ' - ' + 'Push to device ' + req.param('token')
			});
		});

	//Get latest version of pass
	router.get('/api/passes/:passTypeIdentifier/:serialNumber', function(req, res) {
		console.log('Push to device ' + req.param('token'));
		res.status(200).send({
			message: 'Get latest version of ' + req.params.passTypeIdentifier
		});
	});

	//Send push to device
	router.get('/api/devices/:deviceLibraryIdentifier/push/:token', function(req, res) {
		console.log('Push to device ' + req.param('token'));
		res.status(200).send({
			message: 'Device push token'
		});
	});


	/**
	 * I am the signpass route
	 */
	router.get('/api/sign/:id', function(
		req, res) {
		var passFile = req.param('path');
		if (passFile) {
			jpsPassbook.sign(passFile, function(data) {
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
	router.get('/api/export/:id', function(req, res) {
		var id = req.params.id;
		if (id) {
			program.db.get(id).then(function(resp) {
				console.log('found pass', resp._id);
				jpsPassbook.createPass(config.publicDir, resp, function(data) {
					res.status(200).send(data);
				});
			})
		} else {
			res.status(400).send('Must provide file path!');
		}
	});


	app.use(serveStatic(config.staticDir, null));

	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		res.header('Access-Control-Allow-Methods',
			'GET,PUT,POST,DELETE,PATCH,HEAD,CONNECT');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Cache-Control', 'no-cache');


		program.log.info('%s %s', req.method, req.url);
		next();
	});

	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.status(500).send('Something broke!');
	});


	app.use('/', router);

	program.log.log( 'info', 'jps-passbook-routes initialized');
};
