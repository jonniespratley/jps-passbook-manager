'use strict';

const _ = require('lodash');
const utils = require('../utils');
const request = require('request');

module.exports = function(options) {
	options = options || {};
	var logger = utils.getLogger('couchdb');
	const BASE_URL = options.baseUrl || 'http://localhost:4987/passmanager';

	var defaultOptions = {
		method: 'GET',
		//json: true,
		headers: {
			//'Accept': 'application/json',
			'Content-Type': 'application/json',
			'x-token': 'my-token'
		}
	};

	var baseRequest = request.defaults(defaultOptions);

	var sendRequest = function(options) {
		options.url = `${BASE_URL}/${options.url}`;

		logger('sendRequest', options);
		let _response = {};
		return new Promise(function(resolve, reject) {
			_.defer(function() {
				request(options, function(err, resp, body) {
					if (err) {
						reject(err);
					}
					logger('response', body);
					_response.data = body;

					if (!options.json) {
						try {
							_response.data = JSON.parse(body);
							resolve(_response.data);
						} catch (e) {
							resolve(_response.data);
							logger('ERROR', options.url, 'Could not parse json', e);
						}
					} else {
						resolve(_response.data);
					}

				});
			});
		});
	};

	var api = {
		get: function(id) {
			logger('get', id);
			return new Promise(function(resolve, reject) {
				sendRequest({
					method: 'GET',
					url: `${id}`
				}).then(resolve, reject);
			});
		},
		remove: function(id, rev) {
			logger('remove', id);
			return new Promise(function(resolve, reject) {
				sendRequest({
					url: `${id}?rev=${rev}`,
					method: 'DELETE'
				}).then(resolve, reject);
			});
		},
		put: function(doc) {
			logger('put', doc);
			return new Promise(function(resolve, reject) {
				if (!doc._rev) {
					api.get(doc._id).then(function(resp) {
						doc._rev = resp._rev;
						sendRequest({
							url: `${doc._id}`,
							method: 'PUT',
							json: true,
							body: doc
						}).then(resolve, reject);
					}).catch(function(err) {
						sendRequest({
							url: `${doc._id}`,
							method: 'PUT',
							json: true,
							body: doc
						}).then(resolve, reject);
					});
				}
			});
		},
		saveAll: function(docs) {
			return new Promise(function(resolve, reject) {
				sendRequest({
					url: `_bulk_docs`,
					method: 'PUT',
					json: true,
					body: {
						docs: docs
					}
				}).then(resolve, reject);
			});
		},
		post: function(doc) {
			doc._id = require('node-uuid').v4();
			return new Promise(function(resolve, reject) {
				sendRequest({
					url: `${doc._id}`,
					method: 'PUT',
					json: true,
					body: doc

				}).then(resolve, reject);
			});
		},
		find: function(params) {
			return new Promise(function(resolve, reject) {
				sendRequest({
					method: 'GET',
					url: '_all_docs?include_docs=true',
					json: false
				}).then(function(resp) {

					var docs = [];
					resp.rows.forEach(function(row) {
						docs.push(row.doc);
					});
					var filtered = _.findLast(docs, params);
					resolve(filtered);

				}, reject);
			});
		},
		allDocs: function(params) {
			return new Promise(function(resolve, reject) {
				sendRequest({
					url: '_all_docs?include_docs=true',
					method: 'GET',
					json: false
				}).then(function(resp) {
					var docs = resp.rows.filter(function(row) {
						return row.doc;
					});

					logger('allDocs', docs);

					resolve(_.filter(docs, params));
				}, reject);
			});
		}
	};

	return api;
};
