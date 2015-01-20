//## Dependencies
var mongo = require('mongodb');
var path = require('path');
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;
var fs = require('fs');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var app = express();


//## REST Resource
//This is the resource object that contains all of the REST api methods for a full CRUD on a mongo account document.

module.exports = function (config) {
	var RestResource = {
		useversion: 'v1',
		name: 'passes',
		databaseName: 'passbookmanager',
		urls: {
			v1: '/api/v1',
			v2: '/api/v2/'
		},
		//Configuration object from above, to hold settings
		config: null,
		server: null,
		db: null,
		mongoServer: mongo.Server,
		mongoDb: mongo.Db,
		bson: mongo.BSONPure,
		host: null,
		port: null,
		/**
		 * I am the example schema for this resources.
		 */
		schema: {
			id: 0,
			appid: 'com.domain.app',
			title: 'This is the title',
			body: 'This is the body.',
			created: new Date(),
			modified: new Date
		},
		/**
		 * I enable logging or not.
		 */
		debug: true,
		/**
		 * I am the interal logger.
		 */
		log: function (obj) {
			if (this.debug) {
				console.log(obj);
			}
		},
		//Init the resource applying the config object
		init: function (config) {
			var self = this;
			this.config = config;

			MongoClient.connect(config.db.url, function (err, db) {
				self.db = db;
				if (!err) {
					self.log('Connected to ' + self.databaseName);
					db.collection(self.name, {
						safe: true
					}, function (err, collection) {
						if (err) {
							self.log('The collection ' + self.name + ' exist. creating it with sample data...', self.populateDb());
							self.populateDb();
						}
					});
				}
			});

		},

		//### index()
		//Display default message on index
		index: function (req, res, next) {
			res.json({
				message: this.config.message + ' -  ' + config.version
			});
		},

		//### collections()
		//Display list of default collections
		collections: function (req, res, next) {
			res.json({
				message: config.message + ' -  ' + config.version,
				results: config.collections
			});
		},

		//### get()
		//Fetch all records.
		get: function (req, res, next) {
			var self = this;
			var query = req.query.query ? JSON.parse(req.query.query) : {};

			// Providing an id overwrites giving a query in the URL
			if (req.params.id) {
				query = {
					'_id': new BSON.ObjectID(req.params.id)
				};
			}
			//Pass a appid param to get all records for that appid
			if (req.param('appid')) {
				query['appid'] = String(req.param('appid'));
			}
			var options = req.params.options || {};

			//Test array of legal query params
			var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];

			//loop and test
			for (o in req.query) {
				if (test.indexOf(o) >= 0) {
					options[o] = req.query[o];
				}
			}
			//Log for interal usage
			console.log('query', query, 'options', options);

			//open database
			MongoClient.connect(config.db.url, function (err, db) {
				if (err) {
					console.log(err);
				} else {
					//prep collection
					db.collection(req.params.collection, function (err, collection) {
						//query
						collection.find(query, options, function (err, cursor) {
							cursor.toArray(function (err, docs) {
								if (err) {
									console.log(err);
								} else {
									var result = [];
									if (req.params.id) {
										if (docs.length > 0) {
											result = self.flavorize(null, docs[0], "out");
											res.header('Content-Type', 'application/json');
											res.jsonp(200, result);
										} else {
											res.jsonp(404, 'Not found');
											//res.send(404);
										}
									} else {
										docs.forEach(function (doc) {
											result.push(doc);
										});
										res.header('Content-Type', 'application/json');
										res.jsonp(200, result);
									}
									db.close();
								}
							});
						});
					});
				}
			});
		},

		//### add()
		//Handle saving a document to the database.
		add: function (req, res, next) {
			var data = req.body;
			if (data) {

				MongoClient.connect(config.db.url, function (err, db) {
					console.warn('adding to db', db, data);
					if (err) {
						console.log(err);
					} else {
						db.collection(req.params.collection, function (err, collection) {
							collection.count(function (err, count) {
								console.log("There are " + count + " records.");
							});
						});
						var results = [];
						db.collection(req.params.collection, function (err, collection) {
							//Check if the posted data is an array, if it is, then loop and insert each document
							if (data.length) {
								//insert all docs
								for (var i = 0; i < data.length; i++) {
									var obj = data[i];
									console.log(obj);
									collection.insert(obj, function (err, docs) {
										results.push(obj);
									});
								}
								db.close();
								//  res.header('Location', '/'+req.params.db+'/'+req.params.collection+'/'+docs[0]._id.toHexString());
								res.header('Content-Type', 'application/json');
								res.jsonp(200, {
									results: results
								});
							} else {
								collection.insert(req.body, function (err, docs) {
									res.header('Location', '/' + req.params.db + '/' + req.params.collection + '/' + docs[0]._id.toHexString());
									res.header('Content-Type', 'application/json');
									res.send('{"ok":1}', 201);
									db.close();
								});
							}
						});
					}
				});
			} else {
				res.header('Content-Type', 'application/json');
				res.send('{"ok":0}', 200);
			}
		},

		//### edit()
		//Handle updating a document in the database.
		edit: function (req, res, next) {
			var spec = {
				'_id': new BSON.ObjectID(req.params.id)
			};

			MongoClient.connect(config.db.url, function (err, db) {
				db.collection(req.params.collection, function (err, collection) {
					collection.update(spec, req.body, true, function (err, docs) {
						res.header('Location', '/' + req.params.db + '/' + req.params.collection + '/' + req.params.id);
						res.header('Content-Type', 'application/json');
						res.send('{"ok":1}');
						db.close();
						console.log('Location', '/' + req.params.db + '/' + req.params.collection + '/' + req.params.id);
					});
				});
			});
		},

		//### view()
		//Handle fetching associated documents for document detail view.
		view: function (req, res, next) {
		},

		//### populateDb()
		//I populate the document db with the schema.
		populateDb: function () {
			var self = this;
			RestResource.db.collection(self.name, function (err, collection) {
				collection.insert(self.schema, {
					safe: true
				}, function (err, result) {
					self.log(result);
				});
			});
		},

		dbStatus: function () {
			console.log('get db status');
		},
		/**
		 * I find all of the records
		 * @param {Object} req
		 * @param {Object} res
		 */
		findAll: function (req, res) {
			RestResource.db.collection(req.params.collection, function (err, collection) {
				collection.find().toArray(function (err, items) {
					RestResource.log(req.params.collection + ':findAll - ' + JSON.stringify(items));
					res.send(items);
				});
			});
		},
		/**
		 * I find one of the records by id.
		 * @param {Object} req
		 * @param {Object} res
		 */
		findById: function (req, res) {
			var id = req.params.id;
			this.log(RestResource.name + ':findById - ' + id);
			RestResource.db.collection(RestResource.name, function (err, collection) {
				collection.findOne({
					'_id': new BSON.ObjectID(id)
				}, function (err, item) {
					res.send(item);
				});
			});
		},
		destroy: function (req, res, next) {
			var params = {
				_id: new BSON.ObjectID(req.params.id)
			};
			console.log('Delete by id ' + req.params.id);
			var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {
				auto_reconnect: true,
				safe: true
			}));

			RestResource.db.collection(req.params.collection, function (err, collection) {
				console.log('found ', collection.collectionName, params);
				collection.remove(params, function (err, docs) {
					if (!err) {
						res.header('Content-Type', 'application/json');
						res.send('{"ok":1}');
						db.close();
					} else {
						console.log(err);
					}
				});
			});

		}
	};
};
