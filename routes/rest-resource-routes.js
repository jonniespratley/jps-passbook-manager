var express = require('express'),
	bodyParser = require('body-parser'),
	util = require('util'),
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


	router.get(config.baseUrl, function(req, res, next){
		res.status(200).send({message: 'Get collections'});
	});

	router.get(config.baseUrl + '/stats', function(req, res, next){
		console.log('stats');
		rest.stats().then(function(data){
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
	});

	router.get(config.baseUrl + '/collections', function(req, res, next){
		console.log('getCollections');
		rest.getCollections().then(function(data){
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
	});

	//GET - Get collection status
	router.get(config.baseUrl + '/collections/:name', function(req, res, next){
		console.log('getCollectionStatus');
		rest.getCollectionStatus(req.params.name).then(function(data){
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
		next();
	});

	//GET - Get all records
	router.get(config.baseUrl +  '/collections/:col', function (req, res, next) {

		var col = req.params.col;
		var query = null;
		var options = req.query;

		console.warn('collections ', req.params);

		rest.fetch(col, query, options).then(function (data) {
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
		next();
	});

	//GET - Get 1 record
	router.get(config.baseUrl +  '/collections/:col/:id?', function (req, res, next) {

		var col = req.params.col;
		var id = req.params.id;

		rest.findById(col, id).then(function (data) {
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
		next();
	});

	//POST - Create 1 record
	router.post(config.baseUrl + '/collections/:col', bodyParser.json(), function(req, res, next){
		var col = req.params.col, data = req.body;
		rest.add(col, data).then(function(msg){
			res.status(201).send(msg);
		}, function (err) {
			res.status(400).send(err);
		});

	});

	//PUT - Update 1 record
	router.put(config.baseUrl +  '/collections/:col/:id', bodyParser.json(), function(req, res, next){
		var col = req.params.col, data = req.body, id = req.params.id;
		rest.edit(col, id, data).then(function(msg){
			res.status(200).send(msg);
		}, function (err) {
			res.status(404).send(err);
		});
		next();
	});

	//DELETE - Remove 1 record
	router.delete(config.baseUrl +  '/collections/:col/:id', function(req, res, next){
		var col = req.params.col, id = req.params.id;
		rest.destroy(col, id).then(function(msg){
			res.status(200).send(msg);
		}, function (err) {
			res.status(400).send(err);
		});
		next();
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
		//res.header('Content-Type', 'application/json');

		util.log(util.format('[rest-routes] - %s - %s %s %s', req.method, req.url, JSON.stringify(req.query), JSON.stringify(req.params)));

		next();
	});


	app.use('/', router);
};
