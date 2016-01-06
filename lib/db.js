'use strict';
var logger = require('debug')('jps-passbook-manager:store');
var instance = null;
var _ = require('lodash');
var Store = require('jfs');

function FileDataStore(name) {

	var db = new Store(name || 'data', {
		saveId: '_key',
		pretty: true
	});
	var _ds = {
		allDocs: function(params) {
			let o;
			let _docs = [];
			logger('allDocs', params);
			return new Promise(function(resolve, reject) {
				db.all(function(err, objs) {
					if (err) {
						reject(err);
					}
					for (o in objs) {
						_docs.push(objs[o]);
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
		}
	};
	_ds.allSync = db.allSync;
	_ds.getSync = db.getSync;
	instance = _ds;

	return instance;
}

module.exports.getInstance = function(){
	if(instance){
		return instance;
	} else {
		return new FileDataStore();
	}
};

exports.FileDataStore = FileDataStore;

function PouchDataStore(name) {
	var PouchDB = require('pouchdb');
	var db = new PouchDB(name);
	PouchDB.debug('*');
	var _ds = {
		findOne: function(id, params) {
			return db.get(id, params);
		},
		findAll: function(params) {
			return db.allDocs(params);
		},
		create: function(id, data) {
			return db.put(data, id);
		},
		update: function(id, data) {
			return db.get(id).then(function(resp) {
				data._rev = resp._rev;
				return db.put(data, id);
			});
		},
		remove: function(id) {
			return db.get(id).then(function(resp) {
				return db.remove(resp);
			});
		}
	};
	return _ds;
}

exports.PouchDataStore = PouchDataStore;
