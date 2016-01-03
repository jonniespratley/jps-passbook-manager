'use strict';
var logger = require('debug')('jps:store');
var instance = null;
function FileDataStore(name) {
	var Store = require('jfs');
	var db = new Store(name);

	var _docs = {};
	var _ds = {
		allDocs: function (params) {
			logger('allDocs', params);
			return new Promise(function (resolve, reject) {
				db.all(function (err, objs) {
					if (err) {
						reject(err);
					}
					_docs = objs;
					resolve({
						docs: objs
					});
				});
			});
		},
		put: function (doc, id) {
			logger('put', doc._id);
			return new Promise(function (resolve, reject) {
				db.save(doc._id || id, doc, function (err) {
					if (err) {
						reject(err);
					}
					resolve(doc);
				});
			});
		},
		post: function (doc) {
			logger('post');
			return new Promise(function (resolve, reject) {
				db.save(doc, function (err) {
					if (err) {
						reject(err);
					}
					resolve(doc);
				});
			});
		},
		remove: function (id) {
			logger('remove', id);
			return new Promise(function (resolve, reject) {
				db.delete(id, function (err) {
					if (err) {
						reject(err);
					}
					resolve(id);
				});
			});
		},
		get: function (id, options) {
			logger('get', id);
			return new Promise(function (resolve, reject) {
				if (_docs[id]) {
					resolve(_docs[id]);
				} else {
					db.get(id, function (err, obj) {
						if (err) {
							reject(err);
						}
						resolve(obj);
					});
				}
			});
		}
	};
	instance = _ds;
	return _ds;
}

exports.FileDataStore = FileDataStore;

function PouchDataStore(name) {
	var PouchDB = require('pouchdb');
	var db = new PouchDB(name);
	PouchDB.debug('*');
	var _ds = {
		findOne: function (id, params) {
			return db.get(id, params);
		},
		findAll: function (params) {
			return db.allDocs(params);
		},
		create: function (id, data) {
			return db.put(data, id);
		},
		update: function (id, data) {
			return db.get(id).then(function (resp) {
				data._rev = resp._rev;
				return db.put(data, id);
			});
		},
		remove: function (id) {
			return db.get(id).then(function (resp) {
				return db.remove(resp);
			});
		}
	};
	return _ds;
}

exports.PouchDataStore = PouchDataStore;
