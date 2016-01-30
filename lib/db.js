'use strict';

var logger = require('debug')('jps-passbook-manager:store');
var instance = null;
var _ = require('lodash');
var Store = require('jfs');

function FileDataStore(name, options) {
	//logger('new FileDataStore', name, options)
	var db = new Store(name, options || {
		saveId: '_key',
		//	type: 'single',
		pretty: true
	});
	var _ds = {
		findBy: function(params) {
			logger('findBy', params);
			return this.find(params).then(function(resp) {
				return _(resp).first();
			});
		},
		find: function(params) {
			logger('find', params);
			return new Promise(function(resolve, reject) {
				let o,
					_out,
					documents = db.allSync(),
					_docs = [];

				for (o in documents) {
					_docs.push(documents[o]);
				}
				_out = _.where(_docs, params);

				if (_out && _out.length > 0) {
					logger('find.success', _out.length);
					resolve(_out);
				} else {
					reject({
						error: 'No match found',
						params: params
					});
				}
			});
		},
		allDocs: function(params) {
			let _docs = [],
				o;
			logger('allDocs', params);
			return new Promise(function(resolve, reject) {
				_.defer(function() {
					db.all(function(err, objs) {
						if (err) {
							reject(err);
						}
						for (o in objs) {
							_docs.push(objs[o]);
						}
						if (params) {
							_docs = _.filter(_docs, params);
						}
						resolve({
							rows: _docs
						});
					});
				});
			});
		},
		put: function(doc, id) {
			logger('put', doc._id);
			return new Promise(function(resolve, reject) {
				_.defer(function() {
					db.save(doc._id || id, doc, function(err) {
						if (err) {
							reject(err);
						}
						logger('put.success', doc._id);
						resolve(doc);
					});
				});
			});
		},
		post: function(doc) {
			doc._id = require('node-uuid').v4();
			logger('post', doc);
			return new Promise(function(resolve, reject) {
				_.defer(function() {
					db.save(doc, function(err) {
						if (err) {
							reject(err);
						}
						logger('post.success', doc._id);
						resolve(doc);
					});
				});
			});
		},
		remove: function(id) {
			logger('remove', id);
			return new Promise(function(resolve, reject) {
				_.defer(function() {
					db.delete(id, function(err) {
						if (err) {
							reject(err);
						}
						logger('remove.success', id);
						resolve(id);
					});
				});
			});
		},
		get: function(id, options) {
			logger('get', id);
			return new Promise(function(resolve, reject) {
				_.defer(function() {
					db.get(id, function(err, obj) {

						if (err) {
							reject(err);
						}
						logger('get.success', obj);
						resolve(obj);
					});
				});
			});
		},
		saveAll: function(docs) {
			var self = this;
			var saves = docs;
			logger('saveAll', docs.length);
			return new Promise(function(resolve, reject) {
				var done = _.after(saves.length, function() {
					logger('saveAll.success');
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
