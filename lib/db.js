'use strict';

var logger = require('debug')('jps-passbook-manager:store');
var instance = null;
var _ = require('lodash');
var Store = require('jfs');

function FileDataStore(name, options) {

	var db = new Store(name, options || {
		saveId: '_key',
		//	type: 'single',
		pretty: true
	});
	var _ds = {
		find: function(params) {
			logger('find', params);
			return this.allDocs(params).then(function(resp) {
				return _.filter(resp.rows, params);
			});
		},
		allDocs: function(params) {
			var o;
			var _docs = [];
			logger('allDocs', params);
			return new Promise(function(resolve, reject) {
				db.all(function(err, objs) {
					if (err) {
						reject(err);
					}
					for (o in objs) {
						_docs.push(objs[o]);
					}
					if (params) {
						_docs = _.filter(_docs, params)
					}
					resolve({
						rows: _docs
					});
				});
			});
		},
		put: function(doc, id) {
			logger('put', doc._id);
			return new Promise(function(resolve, reject) {
				db.save(doc._id || id, doc, function(err) {
					if (err) {
						reject(err);
					}
					resolve(doc);
				});
			});
		},
		post: function(doc) {
			logger('post', doc);
			return new Promise(function(resolve, reject) {
				db.save(doc, function(err) {
					if (err) {
						reject(err);
					}
					resolve(doc);
				});
			});
		},
		remove: function(id) {
			logger('remove', id);
			return new Promise(function(resolve, reject) {
				db.delete(id, function(err) {
					if (err) {
						reject(err);
					}
					resolve(id);
				});
			});
		},
		get: function(id, options) {
			logger('get', id);
			return new Promise(function(resolve, reject) {
				db.get(id, function(err, obj) {
					if (err) {
						reject(err);
					}
					resolve(obj);
				});
			});
		},
		saveAll: function(docs) {
			var self = this;
			var saves = docs;
			return new Promise(function(resolve, reject) {
				var done = _.after(saves.length, function() {
					console.log('done saving!');
					resolve(saves);
				});
				_.forEach(saves, function(doc) {
					self.put(doc).then(done);
				});
			});
		}
	};
	_ds.saveSync = db.saveSync;

	_ds.allSync = db.allSync;
	_ds.getSync = db.getSync;
	instance = _ds;

	return instance;
}

module.exports.getInstance = function() {
	if (instance) {
		return instance;
	} else {
		return new FileDataStore();
	}
};

exports.FileDataStore = FileDataStore;
