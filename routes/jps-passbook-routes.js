var express = require('express'), bodyParser = require('body-parser'), jsonParser = bodyParser.json();
var jpsPassbook = require('./jps-passbook');
var serveStatic = require('serve-static');
var mongo = require('mongodb');
var path = require('path');
var util = require('util');
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
var sys = require('sys');
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

		console.log(('[unregister] - [%s] with pass id [%s] and serial [%s]'), device.deviceLibraryIdentifier, device.passTypeIdentifier, device.serialNumber);

		rest.destroy('registrations', device).then(function (data) {
			res.status(200).send(data);
		}, function (err) {
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

		console.log(('[register] - [%s] with pass id [%s] and serial [%s]'), device.deviceLibraryIdentifier, device.passTypeIdentifier, device.serialNumber);

		//Check if device and pass already exist, if so, return passes
		rest.fetch('registrations', null, {
			serialNumber: device.serialNumber,
			deviceLibraryIdentifier: device.deviceLibraryIdentifier
		}).then(function (o) {

			console.warn('found registration', o);

			res.status(200).send({
				message: 'Device ' + device.deviceLibraryIdentifier + ' already registered to ' + device.serialNumber
			});

		}, function (e) {

			console.warn('Did not find device and pass in registrations table, add new entry ');

			rest.add('registrations', device).then(function (data) {
				res.status(201).send({
					message: 'Registered device ' + device.deviceLibraryIdentifier,
					data: device
				});
			}, function (err) {
				res.status(400).send(err);
			});

		});

	};

	router.route(config.baseUrl + '/passes').all(function (req, res, next) {
		next();
	})
	.get(function (req, res, next) {
		var col = 'passes';
		var id = req.params.id;
		var query = req.query;

		rest.fetch(col, query, {}).then(function (data) {
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});

	})
	.post(jsonParser, function (req, res, next) {
		var data = req.body;
		var col = 'passes';
		rest.add(req.params.col, req.body).then(function (msg) {
			res.status(201).send(msg);
		}, function (err) {
			res.status(400).send(err);
		});
	});


	//API Endpoint
	router.get(config.baseUrl + '/', function (req, res) {
		res.status(200).send({message: 'Passbook Manager API'});
	});


	//Execute command - http://localhost:4040/api/v1/cmd/ls
	router.get(config.baseUrl + '/' + 'cmd' + '/' + ':command', function (req, res) {
		var results = {}, child, time = Date.now();
		if(req.params.command === 'ls /'){
			res.status(400).send({message: 'Dont lookup disk'});
		}
		child = exec(req.params.command, function (error, stdout, stderr) {
			results.stdout = stdout;
			sys.print('stdout: ' + stdout);

			if (error !== null) {
				console.log('exec error: ' + error);
			}

			res.json({
				time: Date.now() - time,
				command: req.params.command,
				data: results
			});
		});
	});

	//Register Pass on device Endpoint
	//{{url}}/devices/f12b34b237683601016984a239533058/registrations/pass.jsapps.io/gT6zrHkaW
	router.post(config.baseUrl + '/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber?', jsonParser, registerPass);
	//router.post(config.baseUrl + '/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber?', jsonParser, registerPass);

	//Unregister Pass on device
	router.delete(config.baseUrl + '/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', unregisterPass);
	//router.delete(config.baseUrl + '/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', unregisterPass);

	//Logging Endpoint
	router.post(config.baseUrl + '/log', jsonParser, function (req, res) {

		var data = {
			body: JSON.stringify(req.body),
			params: req.params,
			url: req.path,
			time: Date.now().toString()
		};
		rest.add('log', data).then(function (msg) {
			res.status(200).send(msg);
		}, function (err) {
			res.status(400).send(err);
		});

	});

	//Register device
	router.get(config.baseUrl + '/register/:token', function (req, res) {

		console.warn('Register device ' + req.param('token'));
		rest.add('registrations', {
			token: req.param('token'),
			query: req.query
		}).then(function (data) {
			res.status(200).send({
				message: config.name + ' - ' + 'Register device ' + req.param('token')
			});
		});
	});

	//I handle getting the passes for a device
	router.get(config.baseUrl + '/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier', function (req, res, next) {
		console.log('Checking device ' + req.params.deviceLibraryIdentifier);
		var result = {
			serialNumbers: [],
			lastUpdated: Date.now()
		};

		rest.fetch('registrations', {
			deviceLibraryIdentifier: req.params.deviceLibraryIdentifier
		}).then(function (data) {
			console.log('found these', data);

			for (var i = 0; i < data.length; i++) {
				result.serialNumbers.push(data[i].serialNumber);
			}

			res.status(200).send(result);
		});

	});

	//Get latest version of pass
	router.get(config.baseUrl + '/passes/:passTypeIdentifier/:serialNumber?', function (req, res, next) {
		var obj = {};

		if (req.params.passTypeIdentifier && req.params.serialNumber) {
			obj = {
				passTypeIdentifier: req.params.passTypeIdentifier,
				serialNumber: req.params.serialNumber
			};
			util.log('Find pass by' + util.inspect(obj, {colors: true}));
		} else {
			res.status(404).send({
				message: 'Must pass passTypeIdentifier and serialNumber in URL'
			});
		}

		if (req.query.lastest) {
			console.warn('Get latest passes');
		}

		rest.findBy('passes', obj).then(function (data) {
			res.status(200).send(data);
		}, function (err) {
			res.status(404).send(err);
		});
	});

	//Get latest version of pass
	router.get(config.baseUrl + '/:col?', function (req, res, next) {
		var col = req.params.col;
		rest.fetch(col).then(function (data) {
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
	});

	//Send push to device
	router.get(config.baseUrl + '/push/:token', function (req, res, rext) {
		console.log('Push to device ' + req.param('token'));
	});

	//I am the signpass route
	router.get(config.baseUrl + '/passes/:passTypeIdentifier/:serialNumber/sign?', function (req, res, next) {
		var passFilename;
		var obj = {};

		if (req.params.passTypeIdentifier && req.params.serialNumber) {
			obj = {
				passTypeIdentifier: req.params.passTypeIdentifier,
				serialNumber: req.params.serialNumber
			};
			rest.findBy('passes', obj).then(function (pass) {
				passFilename = pass.organizationName + ' ' + pass.description;
				passFilename = passFilename.replace(/\W/g, '-');

				//pass folder path
				var passPath = path.resolve(__dirname, '../www/public' + path.sep + passFilename + '.raw');

				console.log(passPath);


				if (passFilename) {
					jpsPassbook.sign(passPath).then(function (data) {
						res.status(200).send({
							url: data.replace(path.resolve(__dirname, '../www/public'), ''),
							raw: passPath,
							message: passFilename + ' signed.',
							filename: data
						});
						//res.set('Content-Type', 'application/vnd.apple.pkpass').status(200).download(data);
					});
				} else {
					res.status(400).send({
						message: 'Must provide path to .raw folder!'
					});
				}
			}, function (err) {
				res.status(404).send(err);
			});
		} else {
			res.status(404).send({
				message: 'Must pass passTypeIdentifier and serialNumber in URL'
			});
		}

	});

	//I am the export pass route.
	router.get(config.baseUrl + '/passes/:passTypeIdentifier/:serialNumber/export?', function (req, res, next) {

		var col = 'passes';
		var id = req.params.id;

		var obj = {};

		if (req.params.passTypeIdentifier && req.params.serialNumber) {
			obj = {
				passTypeIdentifier: req.params.passTypeIdentifier,
				serialNumber: req.params.serialNumber
			};
			util.log('Export pass by' + util.inspect(obj, {colors: true}));

			rest.findBy(col, obj).then(function (data) {
				var options = {
					pass: data,
					path: config.publicDir
				};
				console.log('Found pass', data);
				res.status(200).send(data);
				jpsPassbook.createPass(options).then(function (pass) {
					console.log('Created pass', pass);
					res.set('Content-Type', 'application/vnd.apple.pkpass');

				}, function (err) {
					req.status(400).send(err);
				});
			}, function (err) {
				req.status(400).send(err);
			});
		} else {
			res.status(404).send({
				message: 'Must pass passTypeIdentifier and serialNumber in URL'
			});
		}
		//next();

	});

	//Global route handler
	app.use(function (req, res, next) {
		util.log(util.format('[jps-passbook-routes] - %s - %s %s %s', req.method, req.url, JSON.stringify(req.query), JSON.stringify(req.params)));
		next();
	});

	app.use('/', router);

	console.warn(('jps-passbook-routes initialized'));
};
