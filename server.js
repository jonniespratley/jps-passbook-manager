/**
 * @author Jonnie Spratley, AppMatrix
 * @created 02/26/13
 */
'use strict';
const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const PouchDB = require('pouchdb');
const debug = require('debug');

const fs = require('fs-extra');

const config = require(path.resolve(__dirname, './config/config.json'));
const port = process.env.PORT || config.server.port || null;
const host = process.env.VCAP_APP_HOST || config.server.hostname || null;

var app = express();
app.use('/', serveStatic(path.resolve(__dirname, './app')));
app.use('/public', serveStatic(path.resolve(__dirname, './www')));

PouchDB.debug('*');
var db = new PouchDB(config.db.local || 'passbookmanager', {db : require('memdown')});

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

var program = {
	log: debug('jps:passbook'),
	getLogger: function(name) {
		return debug('jps:passbook:' + name);
	},
	config: {
		defaults: config
	},
	db: db,
	ds: _ds,
	app: app
};

var middleware = [
	path.resolve(__dirname, './routes/jps-passbook-routes')
];
middleware.forEach(function(m) {
	require(m)(program, app);
});


app.listen(port, host, function() {
	program.log('listen', host, port);
});
