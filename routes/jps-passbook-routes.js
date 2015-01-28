var express = require('express'), bodyParser = require('body-parser'), jsonParser = bodyParser.json();
var chalk = require('chalk');
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

	//Handle unregistering a device
	var unregisterPass = function (req, res, next) {

		var device = {
			deviceLibraryIdentifier: req.params.deviceLibraryIdentifier,
			passTypeIdentifier: req.params.passTypeIdentifier,
			serialNumber: req.params.serialNumber
		};

		console.log(chalk.yellow('[unregister] - [%s] with pass id [%s] and serial [%s]'), device.deviceLibraryIdentifier, device.passTypeIdentifier, device.serialNumber);

		rest.destroy( 'registrations', device).then(function(data){
			res.status(200).send(data);
		}, function(err){
			res.status(400).send(err);
		});
	};


	var registerPass = function (req, res, next) {
		var device = {
			deviceLibraryIdentifier: req.params.deviceLibraryIdentifier,
			passTypeIdentifier: req.params.passTypeIdentifier,
			serialNumber: req.params.serialNumber,
			pushToken: req.body.pushToken,
			authToken: req.get('Authorization')
		};

		console.log(chalk.yellow('[register] - [%s] \n [passTypeId] - [%s], \n [serial] - [%s], \n [pushToken] - [%s], \n [authToken] - [%s]'),
			device.deviceLibraryIdentifier,
			device.passTypeIdentifier,
			device.serialNumber,
			device.pushToken,
			device.authToken);

		//Check if device and pass already exist, if so, return passes
		rest.fetch('registrations', null, {serialNumber: device.serialNumber, deviceLibraryIdentifier: device.deviceLibraryIdentifier}).then(function(o){

			console.warn('found registration', o);
			res.status(200).send(o);

		}, function(e){
			rest.add('registrations', device).then(function(data){
				res.status(200).send({
					message: 'Registered device ' + device.deviceLibraryIdentifier,
					data: device
				});
			}, function(err){
				res.status(400).send(err);
			});
		});
	};




	//API Endpoint
	router.get(config.baseUrl, function (req, res) {
		var body = config.name;
		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Content-Length', body.length);
		res.end(body);
	});

	//Execute command - http://localhost:4040/api/v1/cmd/ls
	router.get(config.baseUrl + '/' + 'cmd' + '/' + ':command', function (req, res) {
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


	//Register Pass on device Endpoint
	//{{url}}/devices/f12b34b237683601016984a239533058/registrations/pass.jsapps.io/gT6zrHkaW
	router.post(config.baseUrl + '/:db/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber?', jsonParser, registerPass);
	router.post(config.baseUrl + '/v1/:db/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber?', jsonParser, registerPass);

	//Unregister Pass on device
	router.delete(config.baseUrl + '/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', unregisterPass);
	router.delete(config.baseUrl + '/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', unregisterPass);


	//Logging Endpoint
	router.post(config.baseUrl +  '/log', jsonParser, function (req, res) {

		var data = {
			body: JSON.stringify(req.body),
			params: req.params,
			url: req.path,
			time: Date.now()
		};
		rest.add('log', data).then(function(msg){
			res.status(200).send(msg);
		}, function(err){
			res.status(400).send(err);
		});

	});


	//Register device
	router.get(config.baseUrl + '/register/:token', function (req, res) {

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

	//I handle getting the passes for a device
	router.get(config.baseUrl +  '/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier', function (req, res, next) {
		console.log('Checking device ' + req.params.deviceLibraryIdentifier);
		var result = {
			serialNumbers:[],
			lastUpdated: Date.now()
		};

		rest.fetch('registrations', { deviceLibraryIdentifier: req.params.deviceLibraryIdentifier }).then(function(data){
			console.log('found these', data);

			for (var i = 0; i < data.length; i++) {
				result.serialNumbers.push(data[i].serialNumber);
			}

			res.status(200).send(result);
		});



	});

	//Get latest version of pass
	router.get(config.baseUrl + '/passes/:passTypeIdentifier/:serialNumber?', function (req, res, next) {


		var obj = {
			passTypeIdentifier: req.params.passTypeIdentifier,
			serialNumber: req.params.serialNumber
		};

		if(req.query.lastest){
			consol.warn('Get latest');
		}

		rest.fetch('passes', {}, obj).then(function(data){
			res.status(200).send(data);
		}, function(err){
			res.status(400).send(err);
		});
		console.log('Compare pass serial number and get passes', JSON.stringify(obj));

	});


	//Send push to device
	router.get(config.baseUrl + '/push/:token', function (req, res, rext) {
		console.log('Push to device ' + req.param('token'));
	});


	//I am the signpass route
	router.get(config.baseUrl + '/:db/:col/:id/sign', function (req, res, next) {
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

	//I am the export pass route.
	router.get(config.baseUrl +  '/:db/:col/:id/export', function (req, res) {
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
					res.set('Content-Type', 'application/vnd.apple.pkpass').status(200).send(pass);
				});
			}, function (err) {
				req.status(400).send(err);
			});

		} else {
			res.status(400).send('Must provide _id');
		}
	});



	//Global route handler
	app.use(function(req, res, next){
		console.log(chalk.green('[jps-passbook-routes] - %s - %s %s %s %s'), req.method, req.url, JSON.stringify(req.query), req.body, JSON.stringify(req.params));
		next();
	});


	app.use('/', router);

	console.warn(chalk.yellow('jps-passbook-routes initialized'));
};
