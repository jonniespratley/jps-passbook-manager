'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const Router = express.Router;
const expressValidator = require('express-validator');
const jsonParser = bodyParser.json();
const Passbook = require('./../lib/jps-passbook');
const serveStatic = require('serve-static');
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
	var logger = program.getLogger('router');
	var jpsPassbook = new Passbook(program);
	logger('initialized');

	var config = program.config.defaults;
	var router = new Router();

	const multipart = require('connect-multiparty');

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
		}, 250);
	});

	// TODO: Get tokens
	router.get('/push/:token', function(req, res) {
		var token = req.params.token;
		logger('Register device ', token);
		res.json({
			message: config.name + ' - ' + 'Register device ' + token
		});
	});


	var multipartMiddleware = multipart();

	router.all('/upload/:id?', multipartMiddleware, function(req, res) {
		var out = [];
		var files = [];
		var file = null;
		var toFilename;

		if (req.method === 'POST') {
			logger('upload', req.files);

			// parse a file upload
			files = req.files;
			for (var f in files) {
				file = files[f];
				logger('upload', 'file', file);
				toFilename = path.resolve(config.dataPath, './passes/' + req.body._id + '.raw/' + file.originalFilename);

				try {
					//	fs.writeFileSync(toFilename, fs.readFileSync(file.path));
					fs.copySync(file.path, toFilename);
					out.push(toFilename);
					logger('upload', 'to', toFilename);
					fs.removeSync(file.path);

				} catch (err) {
					console.error('Oh no, there was an error: ' + err.message);

					res.status(400).json({
						error: err.message
					});
				}


			}
			res.status(200).json(out);

		} else {
			// show a file upload form
			res.writeHead(200, {
				'content-type': 'text/html'
			});
			res.end(
				'<form action="" enctype="multipart/form-data" method="post">' +
				'<input type="file" name="files" multiple="multiple"><br>' +
				//		'<input type="file" name="file"><br>' +
				'<input type="submit" value="Upload">' +
				'</form>'
			);
		}


		// don't forget to delete all req.files when done
	});

	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		res.header('Cache-Control', 'no-cache');
		//	logger(req.method, req.url);
		next();
	});
	//app.use(bodyParser.json());
	//app.use(expressValidator);
	var middleware = [
		path.resolve(__dirname, './jps-middleware-auth'),
		path.resolve(__dirname, './jps-middleware-admin'),
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
