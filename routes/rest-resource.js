//## Dependencies
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var MongoClient = require('mongodb').MongoClient;
var q = require('q');
var assert = require('assert');


//## REST Resource
//This is the resource object that contains all of the REST api methods for a full CRUD on a mongo account document.

module.exports = function (options, app) {
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
			modified: new Date()
		},
		/**
		 * I enable logging or not.
		 */
		debug: true,
		/**
		 * I am the interal logger.
		 */
		log: function () {
			if (this.debug) {
				console.warn(arguments);
			}
		},
		//Init the resource applying the config object
		init: function (c) {
			this.config = c;

			return this;
		},
		connect: function () {
			var self = this;
			var defer = q.defer();
			var config = self.config;

			MongoClient.connect(config.db.url, function (err, db) {
				console.log('Trying to connect to', self.databaseName);
				self.db = db;
				if (!err) {
					self.log('Connected to ' + self.databaseName);
					defer.resolve(db);
				} else {
					console.error('Could not connect to mongodb');
					defer.reject('Could not connect to mongodb');
				}
			});
			return defer.promise;
		},

		//### index()
		//Display default message on index
		index: function (req, res, next) {
			res.status(200).send({
				message: this.config.message + ' -  ' + config.version
			});

		},


		/**
		 * @description I fetch all records from the collection specified.
		 * @param col
		 * @param query
		 * @param options
		 * @returns {*}
		 */
		fetch: function (col, _query, _options) {
			var self = this;
			var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
			var defer = q.defer();
			var db = self.databaseName;

			var options = {} || _options;
			var query = {};

			//loop and test
			for (var s in _options) {
				if (test.indexOf(s) >= 0) {
					options[s] = _options[s];
				}
			}


			//Log for interal usage
			console.log('\ndb:', db, '\ncollection:', col, '\nquery:', query, '\noptions:', options);

			//open database
			MongoClient.connect(config.db.url, function (err, db) {
				if (err) {
					console.log(err);
					defer.reject({error: err});
				} else {

					//prep collection
					db.collection(col, function (err, collection) {
						if (err) {
							console.log(err);
							defer.reject({error: err});
						}
						//query
						collection.find(query, options, function (err, cursor) {
							cursor.toArray(function (err, docs) {
								if (err) {
									console.log(err);
									defer.reject({error: err});
								} else {
									var results = [];
									docs.forEach(function (doc) {
										results.push(doc);
									});
									db.close();

									defer.resolve(results);

								}
							});
						});
					});
				}
			});
			return defer.promise;
		},

		/**
		 * I handle adding a document to the collection
		 * @param req
		 * @param res
		 * @param next
		 */
		add: function (col, data) {
			var defer = q.defer();
			var results = [];

			//TODO - add created_at and updated_at
			data.created_at = new Date();
			data.updated_at = new Date();
			console.log('add() - trying to add document to ', col, data);

			if (data) {
				MongoClient.connect(this.config.db.url, function (err, db) {

					if (err) {
						console.error('add() - Error trying to add document');
						defer.reject({error: err});
					} else {

						db.collection(col, function (err, collection) {
							if (data.length) {
								for (var i = 0; i < data.length; i++) {
									var obj = data[i];
									console.warn('added document', i, obj);
									collection.insert(obj, function (err, docs) {
										results.push(obj);
									});
								}

								db.close();

								console.warn('Done adding ', data.length, 'records');
								defer.resolve(results);

							} else {
								collection.insert(data, function (err, docs) {

									if (err) {
										defer.reject({
											error: err
										});
									} else {
										defer.resolve({
											message: 'Document added to ' + col,
											data: docs[0]._id
										});
									}
									db.close();
								});
							}
						});
					}
				});
			} else {
				defer.resolve({
					message: 'Document created!'
				});
			}
			return defer.promise;
		},

		//### edit()
		//Handle updating a document in the database.
		edit: function (col, id, data) {
			var defer = q.defer();
			var spec = {
				'_id': new BSON.ObjectID(id)
			};
			data._id = new BSON.ObjectID(id);
			data.updated_at = new Date();
			MongoClient.connect(config.db.url, function (err, db) {
				db.collection(col, function (err, collection) {
					if (err) {
						defer.reject({error: err});
					}


					collection.update(spec, data, true, function (err, docs) {
						if (err) {
							defer.reject({error: err});
						} else {
							console.warn('found document', id, 'updating with ', data);
							defer.resolve(docs);
						}
						db.close();
					});
				});
			});
			return defer.promise;
		},

		//### view()
		//Handle fetching associated documents for document detail view.
		view: function (req, res, next) {
		},

		//### populateDb()
		//I populate the document db with the schema.
		populateDb: function () {
			var self = this;
			MongoClient.connect(config.db.url, function (err, db) {
				db.collection(self.name, function (err, collection) {
					collection.insert(self.schema, {
						safe: true
					}, function (err, result) {
						self.log(result);
					});
				});
			});

		},


		/**
		 * I find all of the records
		 * @param {Object} req
		 * @param {Object} res
		 */
		findAll: function (col, id) {
			var defer = q.defer();
			console.warn(col, ':findAll - ', id);
			MongoClient.connect(config.db.url, function (err, db) {
				db.collection(col, function (err, collection) {
					collection.find().toArray(function (err, items) {
						if (err) {
							defer.reject({error: err});
						} else {
							defer.resolve(items);
						}


					});
				});
			});
			return defer.promise;
		},
		/**
		 * I find one of the records by id.
		 * @param {Object} req
		 * @param {Object} res
		 */
		findById: function (col, id) {
			var defer = q.defer();

			console.warn(col, ':findById - ', id);

			try {
				id = new BSON.ObjectID(id);
			} catch (err) {
				defer.reject({error: err});
			}
			return this.findBy(col, {
				'_id': id
			});
		},
		findBy: function (col, params) {
			var defer = q.defer();
			console.warn(col, ':findBy - ', params);

			MongoClient.connect(config.db.url, function (err, db) {
				db.collection(col, function (err, collection) {
					if (err) {
						defer.reject({error: err});
					} else {
						collection.findOne(params, function (err, item) {
							console.log(item);
							if (err) {
								defer.reject({error: err});
							} else if (item === null) {
								defer.reject({error: 'No record was found!'});
							} else {
								defer.resolve(item);
							}

						});
					}

				});
			});
			return defer.promise;
		},
		/**
		 * I handle removing a record from a collection
		 * @param req
		 * @param res
		 */
		destroy: function (col, query) {
			var defer = q.defer();
			var params = query;
			if (!query) {
				throw new Error('Must provide query object!');
			}

			if (query._id) {
				params._id = new BSON.ObjectID(query._id);
			}


			console.log('Delete by id ', params, 'from', col);

			MongoClient.connect(config.db.url, function (err, db) {

				db.collection(col, function (err, collection) {
					if (err) {
						console.error(err);
						defer.reject({
							error: err
						});
					}
					console.log('found ', collection.collectionName, params);

					collection.findAndRemove(params, function (err, doc) {
						if (err) {
							console.error(err);
							defer.reject({
								error: err
							});
						} else {
							defer.resolve({
								message: 'Document was removed!'
							});
						}
					});
				});
			});
			return defer.promise;
		},
		/**
		 * @description I get all of the collection in the database.
		 * @param db
		 * @returns {*}
		 */
		getCollections: function () {
			var defer = q.defer();

			this.connect().then(function (db) {
				// Return the information of a all collections, using the callback format
				db.collectionNames(function (err, items) {
					defer.resolve(items);
					db.close();
				});
			});

			return defer.promise;
		},
		getCollectionStatus: function (name) {
			var defer = q.defer();
			MongoClient.connect(config.db.url, function (err, db) {
				db.collection(name, function (err, collection) {
					collection.count(function (err, count) {
						if (err) {
							defer.reject({error: err});
						} else {
							console.log('There are ' + count + ' records in', name);
							defer.resolve({
								name: name,
								count: count
							});
						}
					});
				});
			});
			console.log('get db status');
			return defer.promise;
		},
		stats: function () {
			var defer = q.defer();
			this.connect().then(function (db) {
				db.stats(function (err, stats) {
					assert.equal(null, err);
					assert.ok(stats != null);
					db.close();
					defer.resolve(stats);
				});
			});
			return defer.promise;
		}
	};

	return RestResource.init(config);
};
