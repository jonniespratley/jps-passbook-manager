//## Dependencies
var express = require('express');



//## REST Resource
//This is the resource object that contains all of the REST api methods for a full CRUD on a mongo account document.

module.exports = function(options, app) {
	'use strict';

	var config = options;
	console.warn('rest-resource initialized');


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
			modified: new Date()
		},
		/**
		 * I enable logging or not.
		 */
		debug: true,
		/**
		 * I am the interal logger.
		 */
		log: function(str) {
			if (this.debug) {
				console.warn('[rest-resource] - ', str);
			}
		},
		//Init the resource applying the config object
		init: function(c) {
			var self = this;

			//Set the config
			RestResource.config = c;

			MongoClient.connect(config.db.url, function(err, db) {
				self.log('Trying to connect to ' + self.databaseName);

				RestResource.db = db;
				if (!err) {
					self.log('Connected to ' + self.databaseName + ' @ ' + config.db.url);

					db.collection(self.name, {
						safe: true
					}, function(err, collection) {
						if (err) {
							self.log('The collection ' + self.name +
								' exist. creating it with sample data...', self.populateDb());
							self.populateDb();
						}
					});
				} else {
					console.error('Could not connect to mongodb');
				}
			});

			return this;

		},

		//### index()
		//Display default message on index
		index: function(req, res, next) {
			res.status(200).send({
				message: RestResource.config.message + ' -  ' + RestResource.config.version
			});
			next();
		},

		//### collections()
		//Display list of default collections
		collections: function(req, res, next) {
			res.status(200).send({
				message: RestResource.config.message + ' -  ' + RestResource.config.version,
				results: RestResource.config.collections
			});
			next();
		},

		//### get()
		//Fetch all records.
		fetch: function(req, res, next) {
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
				query.appid = String(req.param('appid'));
			}
			var options = req.params.options || {};

			//Test array of legal query params
			var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain',
				'snapshot', 'timeout'
			];

			//loop and test
			for (var s in req.query) {
				if (test.indexOf(s) >= 0) {
					options[s] = req.query[s];
				}
			}
			//Log for interal usage
			console.log('query', query, 'options', options);

			//open database
			MongoClient.connect(config.db.url, function(err, db) {
				if (err) {
					console.error(err);
				} else {
					//prep collection
					db.collection(req.params.collection, function(err, collection) {
						//query
						collection.find(query, options, function(err, cursor) {
							cursor.toArray(function(err, docs) {
								if (err) {
									console.log(err);
								} else {
									var result = [];
									if (req.params.id) {
										if (docs.length > 0) {
											result = self.flavorize(null, docs[0], 'out');
											res.header('Content-Type', 'application/json');
											res.status(200).send(result);
										} else {
											res.status(404).send({
												message: 'Not found'
											});
										}
									} else {
										docs.forEach(function(doc) {
											result.push(doc);
										});
										//res.header('Content-Type', 'application/json');
										res.status(200).send(result);
									}
									db.close();
								}
							});
						});
					});
				}
			});
			next();
		},

		/**
		 * I handle adding a document to the collection
		 * @param req
		 * @param res
		 * @param next
		 */
		add: function(req, res, next) {
			var data = req.body;
			var results = [];
			if (data) {
				MongoClient.connect(config.db.url, function(err, db) {
					RestResource.log('add() - trying to add document to ', RestResource.name,
						data);

					if (err) {
						console.error('add() - Error trying to add document');

					} else {

						db.collection(req.params.collection, function(err, collection) {
							collection.count(function(err, count) {
								console.log('There are ' + count + ' records.');
							});
						});


						db.collection(req.params.collection, function(err, collection) {
							if (data.length) {
								for (var i = 0; i < data.length; i++) {
									var obj = data[i];

									console.warn('added document', i, obj);

									collection.insert(obj, function(err, docs) {
										results.push(obj);
									});
								}
								db.close();
								res.header('Location', '/' + req.params.db + '/' + req.params.collection +
									'/' + docs[0]._id.toHexString());
								res.header('Content-Type', 'application/json');
								res.status(200).send(results);

							} else {
								collection.insert(req.body, function(err, docs) {
									res.header('Location', '/' + req.params.db + '/' + req.params
										.collection + '/' + docs[0]._id.toHexString());
									res.header('Content-Type', 'application/json');
									res.status(201).send({
										message: 'Document created!'
									});
									db.close();
								});
							}
						});
					}
				});
			} else {

				res.status(200).send({
					message: 'Document created!'
				});
			}
		},

		//### edit()
		//Handle updating a document in the database.
		edit: function(req, res, next) {
			var spec = {
				'_id': new BSON.ObjectID(req.params.id)
			};

			MongoClient.connect(config.db.url, function(err, db) {
				db.collection(req.params.collection, function(err, collection) {
					collection.update(spec, req.body, true, function(err, docs) {
						res.header('Location', '/' + req.params.db + '/' + req.params.collection +
							'/' + req.params.id);
						res.header('Content-Type', 'application/json');
						res.status(200).send({
							message: 'Document ' + req.params.id + ' updated!'
						});
						db.close();
						console.log('Location', '/' + req.params.db + '/' + req.params.collection +
							'/' + req.params.id);
					});
				});
			});
		},

		//### view()
		//Handle fetching associated documents for document detail view.
		view: function(req, res, next) {},

		//### populateDb()
		//I populate the document db with the schema.
		populateDb: function() {
			var self = this;
			MongoClient.connect(config.db.url, function(err, db) {
				db.collection(self.name, function(err, collection) {
					collection.insert(self.schema, {
						safe: true
					}, function(err, result) {
						self.log(result);
					});
				});
			});

		},

		dbStatus: function() {
			console.log('get db status');
		},
		/**
		 * I find all of the records
		 * @param {Object} req
		 * @param {Object} res
		 */
		findAll: function(req, res) {
			MongoClient.connect(config.db.url, function(err, db) {
				db.collection(req.params.collection, function(err, collection) {
					collection.find().toArray(function(err, items) {
						RestResource.log(req.params.collection + ':findAll - ' + JSON.stringify(
							items));
						res.status(200).send(items);
					});
				});
			});

		},
		/**
		 * I find one of the records by id.
		 * @param {Object} req
		 * @param {Object} res
		 */
		findById: function(req, res) {
			var id = req.params.id;
			this.log(RestResource.name + ':findById - ' + id);
			MongoClient.connect(config.db.url, function(err, db) {
				db.collection(RestResource.name, function(err, collection) {
					collection.findOne({
						'_id': new BSON.ObjectID(id)
					}, function(err, item) {
						res.status(200).send(item);
					});
				});
			});

		},
		destroy: function(req, res, next) {
			var params = {
				_id: new BSON.ObjectID(req.params.id)
			};
			console.log('Delete by id ' + req.params.id);

			MongoClient.connect(config.db.url, function(err, db) {
				db.collection(req.params.collection, function(err, collection) {
					console.log('found ', collection.collectionName, params);

					collection.remove(params, function(err, docs) {
						if (!err) {

							res.status(200).send({
								message: 'Document ' + req.params.id + ' was removed!'
							});
							db.close();
						} else {
							console.error(err);
							res.status(400).send(err);
						}
					});
				});
			});


		}
	};


	return RestResource.init(config);
};
