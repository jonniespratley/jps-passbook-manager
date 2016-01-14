'use strict';
const _ = require('lodash');
const redis = require('redis');
const utils = require('../utils');

module.exports = function(options) {
	var logger = utils.getLogger('redis');
	logger('instance', options);

	var client = redis.createClient({
		//prefix: 'jps:'
	} || options);

	client.on('error', function(err) {
		console.error('Redis Client error', err);
	});

	return {
		get: function(id) {
			logger('get', id);
			return new Promise(function(resolve, reject) {
				client.get(id, function(err, res) {
					if (err) {
						reject(err);
					}
					logger('success', res);
					resolve(JSON.parse(res));
				});
			});
		},
		put: function(doc) {
			logger('put', doc._id);
			return new Promise(function(resolve, reject) {
				client.set(doc._id, JSON.stringify(doc), function(err, res) {
					if (err) {
						reject(err);
					}
					logger('success', res);
					resolve(res);
				});
			});
		},
		remove: function(id) {
			logger('remove', id);
			return new Promise(function(resolve, reject) {
				client.del(id, function(err, res) {
					if (err) {
						reject(err);
					}
					logger('success', res);
					resolve(res);
				});
			});
		},
		allDocs: function(params) {
			return new Promise(function(resolve, reject) {
				client.keys('*', function(err, res) {
					if (err) {
						reject(err);
					}
					_(res).forEach(function(i, n) {
						logger(i, n);
					});
					logger('success', res);
					resolve(res);
				});
			});
		}
	}
};
