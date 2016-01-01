// TODO: Using pouchdb
var PouchDB = require('pouchdb');
module.exports = function(config){
	PouchDB.debug('*');
	var db = new PouchDB( config.name);

	console.log('created db', db);
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

	return db;
};
