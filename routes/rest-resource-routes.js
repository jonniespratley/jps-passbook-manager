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


	//app.get('/api/' + config.version + '/' + config.name, rest.collections);

	app.get('/api/' + config.version + '/:db/:col', function (req, res, next) {
		var db = req.params.db;
		var col = req.params.col;
		var query = req.query;
		var options = {};

		console.log('route:getall', db, col);

		rest.fetch(col, query, options).then(function (data) {
			console.log(data);
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
	});


	app.get('/api/' + config.version + '/:db/:col/:id?', function (req, res, next) {
		var db = req.params.db;
		var col = req.params.col;
		var id = req.params.id;

		console.log('route:get1', db, col, id);

		rest.findById(col, id).then(function (data) {
			console.log(data);
			res.status(200).send(data);
		}, function (err) {
			res.status(400).send(err);
		});
	});

	app.post('/api/' + config.version + '/:db/:col', bodyParser.json(), function(req, res, next){
		var db = req.params.db, col = req.params.col, data = req.body;
		rest.add(col, data).then(function(msg){
			res.status(200).send(msg);
		}, function (err) {
			res.status(400).send(err);
		});
	});
	app.put('/api/' + config.version + '/:db/:col/:id', bodyParser.json(), function(req, res, next){
		var db = req.params.db, col = req.params.col, data = req.body, id = req.params.id;
		rest.edit(col, id, data).then(function(msg){
			res.status(200).send(msg);
		}, function (err) {
			res.status(400).send(err);
		});
	});
	app.delete('/api/' + config.version + '/:db/:col/:id', function(req, res, next){
		var db = req.params.db, col = req.params.col, id = req.params.id;
		rest.destroy(col, id).then(function(msg){
			res.status(200).send(msg);
		}, function (err) {
			res.status(400).send(err);
		});
	});


	// mount the router on the app

	app.use('/', router);
};
