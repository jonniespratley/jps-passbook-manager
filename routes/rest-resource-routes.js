var express = require('express'),
	bodyParser = require('body-parser'),
	jsonParser = bodyParser.json();


// * REST METHODS:
// *
// * HTTP     METHOD          URL
// * ======|==============|==============================================
// * GET      findAll         http://localhost:4040/passbookmanager
// * GET      findById        http://localhost:4040/passbookmanager/passes/:id
// * POST     add             http://localhost:4040/passbookmanager/passes
// * PUT      update          http://localhost:4040/passbookmanager/passes/:id
// * DELETE   destroy         http://localhost:4040/passbookmanager/passes/:id
module.exports = function (config, app) {
	console.log('rest-resource-routes initialized');

	var rest = require('./rest-resource')(config);
	var router = express.Router();


	app.get('/api/' + config.version + '/' + config.name, function(req, res, next){
		res.status(200).send({message: 'Get collections'});
	});

	router.get('/api/' + config.version + '/:db/:col', function (req, res, next) {
		var db = req.params.db;
		var col = req.params.col;
		var query = req.query;
		var options = {};

		rest.fetch(col, query, options).then(function (data) {
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
	});


	router.get('/api/' + config.version + '/:db/:col/:id?', function (req, res, next) {
		var db = req.params.db;
		var col = req.params.col;
		var id = req.params.id;

		rest.findById(col, id).then(function (data) {
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
	});


	router.post('/api/' + config.version + '/:db/:col', bodyParser.json(), function(req, res, next){
		var db = req.params.db, col = req.params.col, data = req.body;
		rest.add(col, data).then(function(msg){
			res.status(201).send(msg);
		}, function (err) {
			res.status(400).send(err);
		});
	});


	router.put('/api/' + config.version + '/:db/:col/:id', bodyParser.json(), function(req, res, next){
		var db = req.params.db, col = req.params.col, data = req.body, id = req.params.id;
		rest.edit(col, id, data).then(function(msg){
			res.status(200).send(msg);
		}, function (err) {
			res.status(404).send(err);
		});
	});


	router.delete('/api/' + config.version + '/:db/:col/:id', function(req, res, next){
		var db = req.params.db, col = req.params.col, id = req.params.id;
		rest.destroy(col, id).then(function(msg){
			res.status(200).send(msg);
		}, function (err) {
			res.status(400).send(err);
		});
	});


	// mount the router on the app
	router.use(express.static(config.staticDir));

	//router.use(serveStatic(config.staticDir, null));
	router.use(function (req, res, next) {
		res.header('Connection', 'keep-alive');
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'X-Requested-With');
		res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, CONNECT');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
		res.header('Cache-Control', 'no-cache');
		res.header('Content-Type', 'application/json');

		console.warn('jps-passbook-routes', req.method, req.body, req.path, JSON.stringify(req.body));
		next();
	});


	app.use('/', router);
};
