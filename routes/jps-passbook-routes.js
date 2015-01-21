var express = require('express'),
	bodyParser = require('body-parser'),
	jsonParser = bodyParser.json();

var jpsPassbook = require('./jps-passbook');
var serveStatic = require('serve-static');
var mongo = require('mongodb');
var path = require('path');
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;
var fs = require('fs');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var sys = require('sys')
var exec = require('child_process').exec;
var router = express.Router();

module.exports = function (config, app) {
	var RestResource = require('./rest-resource')(config);
	router.route('/posts/:postId')
		.all(function (request, response, next) {
			// This will be called for request with any HTTP method
			console.warn('route.all called');
		})
		.post(function (request, response, next) {
		})
		.get(function (request, response, next) {
			response.json(request.post);
		})
		.put(function (request, response, next) {
			// ... Update the post
			response.json(request.post);
		})
		.delete(function (request, response, next) {
			// ... Delete the post
			response.json({'message': 'ok'});
		})

	/* ======================[ @TODO: Listen for Device registration token ]====================== */

//### onError()
//callback handler
	var onError = function (error, note) {
		console.log('Error is: %s', error);
		console.log('Note ' + note);
	};

//Test device tokens
	var deviceTokens = ['54563ea0fa550571c6ea228880c8c2c1e65914aa67489c38592838b8bfafba2a', 'd46ba7d730f8536209e589a3abe205b055d66d8a52642fd566ee454d0363d3f3'];

//API Endpoint
	router.get('/api', function (req, res) {
		var body = config.name;
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Content-Length', body.length);
		res.end(body);
	});

//Execute command - http://localhost:4040/api/v1/cmd/ls
	router.get('/api/' + config.version + '/' + 'cmd' + '/' + ':command', function (req, res) {
		var results = {}, child;
		child = exec(req.params.command, function (error, stdout, stderr) {
			results.stdout = stdout;
			sys.print('stdout: ' + stdout);

			if (error !== null) {
				console.log('exec error: ' + error);
			}

			res.json({
				message: config.name,
				results: results
			});
		});
	});

	//API Version Endpoint - http://localhost:3535/smartpass/v1
	router.get('/api/' + config.version, function (req, res) {
		res.json({
			message: config.name
		});
	});

//Register Pass Endpoint
	router.post('/api/' + config.version + '/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', function (req, res) {
		res.json({
			message: config.name
		});
	});

//Logging Endpoint
	router.post('/api/' + config.version + '/log', function (req, res) {
		console.log(req.body);
		res.json({
			message: config.name
		});
	});

//Unregister Pass
	router.delete('/api/' + config.version + '/devices/:deviceLibraryIdentifier/:passTypeIdentifier/:serialNumber', function (req, res) {
		console.log('Register device ' + req.param('token'));
		res.json({
			message: config.name + ' - ' + 'Delete device ' + req.param('token')
		});
	});

//Register device
	router.get('/api/' + config.version + '/register/:token', function (req, res) {
		console.log('Register device ' + req.param('token'));
		res.json({
			message: config.name + ' - ' + 'Register device ' + req.param('token')
		});
	});

//Get serial numbers
	router.get('/api/' + config.version + '/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier', function (req, res) {
		console.log('Push to device ' + req.param('token'));
		res.json({
			message: config.name + ' - ' + 'Push to device ' + req.param('token')
		});
	});

//Get latest version of pass
	router.get('/api/' + config.version + '/passes/:passTypeIdentifier/:serialNumber', function (req, res) {
		console.log('Push to device ' + req.param('token'));
	});

//Send push to device
	router.get('/api/' + config.version + '/push/:token', function (req, res) {
		console.log('Push to device ' + req.param('token'));
	});




	/**
	 * I am the signpass route
	 */
	router.get('/api/' + config.version + '/:db/:collection/:id/sign', function (req, res) {
		var passFile = req.param('path');
		if (passFile) {
			jpsPassbook.sign(passFile, function (data) {
				//res.status(200).send({message: passFile + ' signed.', filename: data});
				res.status(200).download(data);
			});
		} else {
			res.status(400).send({message: 'Must provide path to .raw folder!'});
		}
	});

	/**
	 * I am the export pass route.
	 *
	 * I handle taking a pass's id, quering the database,
	 * taking the contents of the pass and invoking the createPass method which
	 * creates a .raw folder containing a pass.json file and then invokes the
	 * signpass binary.
	 *
	 */
	router.get('/api/' + config.version + '/:db/:collection/:id/export', function (req, res) {
		var id = req.param('id');
		if (id) {
			console.log(RestResource.name + ':findById - ' + id);

			RestResource.db.collection(RestResource.name, function (err, collection) {
				collection.findOne({
					'_id': new BSON.ObjectID(id)
				}, function (err, item) {
					if (err) {
						res.status(400).send(err);
					}
					passContent = item;
					console.log('found pass', item);
					jpsPassbook.createPass(config.publicDir, passContent, function (data) {
							res.status(200).send(data);
						});
				});
			});
		} else {
			res.status(400).send('Must provide file path!');
		}
	});


	app.use(serveStatic(config.staticDir, null));

	app.use(function (req, res, next) {
		res.header('Connection', 'keep-alive');
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Cache-Control', 'no-cache');
		//res.header('Content-Type', 'application/json');
		console.log('jps-passbook-routes', req.path);
		next();
	});

	app.use(function (err, req, res, next) {
		console.error(err.stack);
		res.status(500).send('Something broke!');
	});

	app.use(function (req, res, next) {
		console.log('%s %s', req.method, req.url);
		next();
	});


	app.use('/', router);

	console.warn('jps-passbook-routes initialized');
};
