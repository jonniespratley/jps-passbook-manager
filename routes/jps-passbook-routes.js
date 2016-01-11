'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router,
	expressValidator = require('express-validator'),
	jsonParser = bodyParser.json();

var Passbook = require('./../lib/jps-passbook');
var serveStatic = require('serve-static');


const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const http = require('http');
const url = require('url');
const assert = require('assert');
const exec = require('child_process').exec;


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
module.exports = function(program, app) {


	if (!program || !app) {
		throw new Error('Must provide an express app as argument 2');
	}

	var logger = program.getLogger('router');
	var jpsPassbook = new Passbook(program);
	logger('initialized');

	var config = program.config.defaults;
	var router = express.Router();
	//var RestResource = require('./rest-resource')(templates);


	/* ======================[ @TODO: Listen for Device registration token ]====================== */

	//### onError()
	//callback handler
	var onError = function(error, note) {
		logger('Error is: %s', error);
	};

	//API Version Endpoint - http://localhost:3535/smartpass/v1
	router.get('/', function(req, res) {
		res.status(200).json({
			message: config.name
		});
	});


	router.post('/log', bodyParser.json(), function(req, res) {
		var dataLog = {};
		dataLog._id = _.uniqueId('log-');
		dataLog.docType = 'log';
		dataLog.data = req.body;
		dataLog.created_at = _.now();
		_.defer(function() {
			program.db.put(dataLog).then(function(resp) {
				res.status(200).json(resp);
			}).catch(function(err) {
				res.status(400).json(err);
			});
		}, 500);
	});

	router.get('/admin/logs', function(req, res) {
		let _logs = [];
		program.db.allDocs({
			docType: 'log'
		}).then(function(resp) {
			_logs = resp.rows.filter(function(row) {
				return row.docType === 'log';
			});
			res.status(200).json(_logs);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});

	router.get('/admin/devices', function(req, res) {
		let _devices = [];
		program.db.allDocs({
			type: 'device'
		}).then(function(resp) {
			_devices = resp.rows.filter(function(row) {
				return row.type === 'device';
			});
			res.status(200).json(_devices);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});
	router.get('/admin/find?', function(req, res) {
		program.db.allDocs(req.query).then(function(resp) {
			res.status(200).json(resp);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});


	// TODO: Get tokens
	router.get('/push/:token', function(req, res) {
		var token = req.params.token;
		logger('Register device ', token);
		res.json({
			message: config.name + ' - ' + 'Register device ' + token
		});
	});


	/**
	 * I am the signpass route
	 */
	router.get('/sign/:id', function(req, res) {
		logger('sign', req.params);

		program.db.get(req.params.id).then(function(resp) {
			if (resp) {
				jpsPassbook.signPass(resp, '-p', function(err, filename) {
					if (err) {
						res.status(404).json(err);
					}
					//res.status(200).send(data);
					res.set('Content-Type', 'application/vnd.apple.pkpass')
						.status(200)
						.download(resp.pkpassFilename);

				});
			} else {
				res.status(400).json({
					message: 'Must id!'
				});
			}
		}).catch(function(err) {
			logger('sign', 'error', err);
			res.status(400).json(err);
		})
	});

	/**
	 * I am the export pass route.
	 *
	 * I handle taking a pass's id, quering the database,
	 * taking the contents of the pass and invoking the createPass method which
	 * creates a .raw folder containing a pass.json file and then invokes the
	 * signpass binary.
	 */
	router.get('/export/:id', function(req, res) {
		var id = req.params.id;
		if (id) {
			logger('id', id);

			program.db.get(id).then(function(resp) {
				logger('found pass', resp);

				jpsPassbook.createPass(resp, true, function(err, data) {
					if (err) {
						res.status(404).json(err);
					}
					logger('createPass', data);
					//res.status(200).json(data);
					res.set('Content-Type', 'application/vnd.apple.pkpass')
						.status(200)
						.download(data);
				});

			}).catch(function(err) {
				res.status(404).json(err);
			});

		} else {
			res.status(400).json('Must provide file path!');
		}
	});


	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Cache-Control', 'no-cache');
		//	logger(req.method, req.url);
		next();
	});

	app.use(function(err, req, res, next) {
		logger('error', err);
		console.error(err.stack);
		res.status(500).send('Something broke!');
		next();
	});

	//app.use(bodyParser.json());
	//app.use(expressValidator);


	var middleware = [
		path.resolve(__dirname, './jps-middleware-auth'),
		path.resolve(__dirname, './jps-middleware-db'),
		path.resolve(__dirname, './jps-middleware-devices'),
		path.resolve(__dirname, './jps-middleware-passes'),
		path.resolve(__dirname, './jps-middleware-sockets')
	];

	middleware.forEach(function(m) {
		logger('add middleware', m);
		require(m)(program, app);
	});


	app.use('/api/' + config.version, router);

};
