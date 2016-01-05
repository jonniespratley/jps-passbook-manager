'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router,
	expressValidator = require('express-validator'),
	jsonParser = bodyParser.json();

var Passbook = require('./../lib/jps-passbook');
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
	var logger = program.getLogger('router');
	var jpsPassbook = new Passbook(program);

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
		logger('Error is: %s', error);
	};

	//API Version Endpoint - http://localhost:3535/smartpass/v1
	router.get('/', function (req, res) {
		res.status(200).json({
			message: config.name
		});
	});


	router.post('/log', bodyParser.json(), function (req, res) {
		program.db.put(req.body, 'logs').then(function (resp) {
			res.status(200).json(resp);
		}).catch(function (err) {
			res.status(400).json(err);
		})

	});


	// TODO: Get tokens
	router.get('/push/:token', function (req, res) {
		var token = req.params.token;
		logger('Register device ', token);
		res.json({
			message: config.name + ' - ' + 'Register device ' + token
		});
	});


	/**
	 * I am the signpass route
	 */
	router.get('/sign/:id', function (req, res) {

		program.db.get(req.params.id).then(function (resp) {
			if (resp) {
				jpsPassbook.signPass(resp.filename).then(function (filename) {
					//res.status(200).send(data);
					res.set('Content-Type', 'application/vnd.apple.pkpass').status(200).download(filename);
				}).catch(function (err) {
					res.status(404).send(err);
				});
			} else {
				res.status(400).send({
					message: 'Must id!'
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
			logger('id', id);

			program.db.get(id).then(function (resp) {
				logger('found pass', resp);

				jpsPassbook.createPass(resp, false).then(function (data) {
					logger('createPass', data);
					res.status(200).send(data);
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

	router.get('/passes?', function (req, res) {
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

	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		res.header('Access-Control-Allow-Methods',
			'GET,PUT,POST,DELETE,PATCH,HEAD,CONNECT');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Cache-Control', 'no-cache');

		logger(req.method, req.url);
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
		path.resolve(__dirname, './jps-middleware-passes'),
		path.resolve(__dirname, './jps-middleware-devices')
	];

	middleware.forEach(function (m) {
		logger('add middleware', m);
		require(m)(program, app);
	});

	logger('initialized');
};
