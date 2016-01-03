'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router,
	expressValidator = require('express-validator'),
	jsonParser = bodyParser.json();

var jpsPassbook = require('./jps-passbook');
var serveStatic = require('serve-static');

var debug = require('debug');
var path = require('path');
var fs = require('fs-extra');
var http = require('http');
var url = require('url');
var assert = require('assert');
var exec = require('child_process').exec;


/**
 * Passbook Routes - This file contains the API routes needed for Passbook and Passbook Manager
 * @example
 *

 var app = express();
 require(__dirname + path.sep + 'routes'+ path.sep +'jps-passbook-routes')(templates, app);


 //Start the server
 app.listen(templates.server.port, function () {
	console.log(templates.message + ' running @: ' + templates.server.host + ':' + templates.server.port);
 });

 * @param templates
 * @param app
 */
module.exports = function (program, app) {

	if (!app) {
		throw new Error('Must provide an express app as argument 2');
	}

	var config = program.config.defaults;
	var router = express.Router();
	//var RestResource = require('./rest-resource')(templates);


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


	router.post('/log', bodyParser.json(), function (req, res) {
		program.db.put(req.body, 'logs').then(function(resp){
			res.status(200).json(resp);
		}).catch(function(err){
			res.status(400).json(err);
		})

	});


	//Register device
	router.get('/register/:token', function (req, res) {
		program.log('Register device ' + req.param('token'));
		res.json({
			message: config.name + ' - ' + 'Register device ' + req.param('token')
		});
	});

	// TODO: Get tokens
	router.get('/push/:token', function (req, res) {
		program.log('Register device ' + req.param('token'));
		res.json({
			message: config.name + ' - ' + 'Register device ' + req.param('token')
		});
	});

	var PassController = require('./controllers/passes-controller');
	var passController = new PassController(program.db);

	//Get latest version of pass
	router.get('/passes/:passTypeIdentifier/:serialNumber?', function (req, res) {
		var auth = req.get('Authorization');

		console.log('Pass ID', req.params.passTypeIdentifier)
		console.log('Pass serialNumber', req.params.serialNumber)

		console.log('Auth header', auth);
		//program.log('Push to device ' + req.param('token'));

		if (!auth) {
			res.status(401).json({error: 'No header'});
		} else {

			passController.findPassBySerial(req.params.serialNumber).then(function (resp) {
				res.send(resp);
			}).catch(function (err) {
				res.status(404).json(err);
			});
		}

	});


	/**
	 * I am the signpass route
	 */
	router.get('/sign/:id', function (req, res) {
		var passFile;

		program.db.get(req.params.id).then(function (resp) {
			assert(resp.paths.filename, 'has filename');
			passFile = resp.paths.filename;
			if (passFile) {
				jpsPassbook.sign(passFile).then( function (data) {
					res.status(200).send({message: passFile + ' signed.', filename: data});
					//res.set('Content-Type', 'application/vnd.apple.pkpass').status(200).download(data);
				}).catch(function (err) {
					res.status(404).send(err);
				});
			} else {
				res.status(400).send({
					message: 'Must provide path to .raw folder!'
				});
			}
		}).catch(function (err) {
			res.status(404).send(err);
		});
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
				resp.passTypeIdentifier = config.passkit.passTypeIdentifier;
				jpsPassbook.createPass(path.resolve(__dirname, config.publicDir), resp).then(function (data) {
					program.log('createPass', data);
					resp.paths = data;
					program.db.put(resp).then(function (out) {
						res.status(200).send(resp);
					});
				}).catch(function (err) {
					res.status(404).send(err);
				});
			}).catch(function (err) {
				res.status(404).send(err);
			});
		} else {
			res.status(400).send('Must provide file path!');
		}
	});


	router.get('/devices', function (req, res) {
		program.db.allDocs({
			startkey: 'device-1',
			endkey: 'device-z',
			include_docs: true
		}).then(function (resp) {
			res.status(200).json(resp);
		}).catch(function (err) {
			res.status(400).json(err);
		});
	});
	router.get('/passes', function (req, res) {
		program.db.allDocs({
			startkey: 'device-1',
			endkey: 'device-z',
			include_docs: true
		}).then(function (resp) {
			res.status(200).json(resp);
		}).catch(function (err) {
			res.status(400).json(err);
		});
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

	app.use(bodyParser.json());
	//app.use(expressValidator);


	app.use('/api/' + config.version, router);
	var middleware = [
		path.resolve(__dirname, './jps-middleware-db'),
		path.resolve(__dirname, './jps-middleware-devices')
	];
	middleware.forEach(function (m) {
		require(m)(program, app);
	});

	program.log('info', 'jps-passbook-routes initialized');
};
