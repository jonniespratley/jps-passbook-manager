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
		getUUID: function (prefix) {
			return prefix || 'doc-' + require('node-uuid').v4();
		},
		findBy: function (params) {
			logger('findBy', params);
			return this.find(params).then(function (resp) {
				return _(resp).first();
			});
		},

		find: function (params) {
			let self = this;
			logger('find', params);
			return new Promise(function (resolve, reject) {
				let _out, _docs = [];

				self.allDocs(params).then(function (resp) {
					_out = _.where(resp.rows, params);

					if (_out && _out.length > 0) {
						logger('find.success', _out.length);
						resolve(_out);
					} else {
						/*TODO - Never reject, just return empty */
						reject({
							error: 'No match found',
							params: params
						});
					}

				});
			});
		},
		allDocs: function (params) {
			return new Promise(function (resolve, reject) {
				let _docs = [], _obj;
				logger('allDocs', params);
				_.defer(function () {
					db.all(function (err, objs) {
						if (err) {
							reject(err);
						}
						for (_obj in objs) {
							_docs.push(objs[_obj]);
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
		put: function (doc, id) {
			logger('put', doc._id);
			return new Promise(function (resolve, reject) {
				_.defer(function () {
					db.save(doc._id || id, doc, function (err) {
						if (err) {
							logger('put.error', err);
							reject(err);
						} else {
							logger('put.success', doc._id);
							resolve(doc);
						}

					});
				});
			});
		},
		post: function (doc) {
			doc._id = this.getUUID();
			logger('post', doc);
			return new Promise(function (resolve, reject) {
				_.defer(function () {
					db.save(doc, function (err) {
						if (err) {
							logger('post.error', err);
							reject(err);
						} else {
							logger('post.success', doc._id);
							resolve(doc);
						}
					});
				});
			});
		},
		remove: function (id) {
			logger('remove', id);
			return new Promise(function (resolve, reject) {
				_.defer(function () {
					db.delete(id, function (err) {
						if (err) {
							logger('remove.error', err);
							reject(err);
						} else {
							logger('remove.success', id);
							resolve(id);
						}
					});
				});
			});
		},
		get: function (id) {
			logger('get', id);
			return new Promise(function (resolve, reject) {
				_.defer(function () {
					db.get(id, function (err, obj) {
						if (err) {
							logger('get.error', err);
							reject(err);
						} else {
							logger('get.success', id);
							resolve(obj);
						}
					});
				});
			});
		},
		saveAll: function (docs) {
			let self = this;
			return new Promise(function (resolve, reject) {
				let saves = [];

				let _done = _.after(docs.length, function () {
					logger('saveAll.success');
					resolve(saves);
				});
				logger('saveAll', docs.length);

				_.forEach(docs, function (doc) {
					doc._id = doc._id || self.getUUID();
					self.put(doc).then(function (resp) {
						logger('put.success', resp._id);
						saves.push(resp);
						_done();
					}).catch(function (err) {
						_done(err);
					});
				});
			});
		}
	};
	_ds.saveSync = db.saveSync;
	_ds.allSync = db.allSync;
	_ds.getSync = db.getSync;

	_ds.bulkDocs = _ds.saveAll;
	_ds.findOne = _ds.findBy;

	instance = _ds;

	return instance;
}

FileDataStore.getInstance = function () {
	if (instance) {
		return instance;
	} else {
		return new FileDataStore();
	}
};


module.exports = function(){

	return FileDataStore;
};
