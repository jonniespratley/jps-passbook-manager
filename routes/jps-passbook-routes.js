var express = require('express'), bodyParser = require('body-parser'), jsonParser = bodyParser.json();

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


	var rest = require('./rest-resource')(config);

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
		rest.add('devices', {
			params: req.params,
			query: req.query,
			data: req.body
		}).then(function(data){
			res.status(200).send({
				message: config.name + ' - ' + 'Register device ' + req.param('token')
			});
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

		console.warn('Register device ' + req.param('token'));
		rest.add('registrations', {
			token: req.param('token'),
			query: req.query
		}).then(function(data){
			res.status(200).send({
				message: config.name + ' - ' + 'Register device ' + req.param('token')
			});
		});
	});

	//Get serial numbers
	router.get('/api/' + config.version + '/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier', function (req, res, next) {
		console.log('Push to device ' + req.param('token'));
		res.json({
			message: config.name + ' - ' + 'Push to device ' + req.param('token')
		});
	});

	//Get latest version of pass
	router.get('/api/' + config.version + '/passes/:passTypeIdentifier/:serialNumber', function (req, res, next) {
		console.log('Push to device ' + req.param('token'));
	});

	//Send push to device
	router.get('/api/' + config.version + '/push/:token', function (req, res, rext) {
		console.log('Push to device ' + req.param('token'));
	});


	/**
	 * I am the signpass route
	 */
	router.get('/api/' + config.version + '/:db/:col/:id/sign', function (req, res, next) {
		var passFile = req.param('path');
		if (passFile) {
			jpsPassbook.sign(passFile, function (data) {
				//res.status(200).send({message: passFile + ' signed.', filename: data});
				res.set('Content-Type', 'application/vnd.apple.pkpass').status(200).download(data);
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
	 *
	 */
	router.get('/api/' + config.version + '/:db/:col/:id/export', function (req, res) {
		var db = req.params.db;
		var col = req.params.col;
		var id = req.params.id;

		console.warn('route:export', db, col, id);

		if (id) {
			rest.findById(col, id).then(function (data) {
				var options = {
					pass: data,
					path: config.publicDir
				};
				jpsPassbook.createPass(options).then(function (pass) {
					res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
					res.status(200).send(pass);
				});
			}, function (err) {
				req.status(400).send(err);
			});

		} else {
			res.status(400).send('Must provide _id');
		}
	});

	app.use('/', router);
	console.warn('jps-passbook-routes initialized');
};
