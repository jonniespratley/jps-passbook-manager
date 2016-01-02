/**
 * @author Jonnie Spratley, AppMatrix
 * @created 02/26/13
 */
 'use strict';

//## Dependencies
const express = require('express'),
	path = require('path'),
  serveStatic = require('serve-static'),
	fs = require('fs-extra'),
	morgan = require('morgan'),
	PouchDB = require('pouchdb');



const config = require(path.resolve(__dirname, './config/config.json'));
const port = process.env.PORT || config.server.port || null;
const host = process.env.VCAP_APP_HOST || config.server.hostname || null;

var app = express();
//app.use(serveStatic(__dirname + '/dist'));
app.use('/', serveStatic(__dirname + '/app'));
app.use('/public', serveStatic( __dirname + '/www'));
app.use(morgan(':method :url :response-time'))

var server = require('http').Server(app);
var io = require('socket.io')(server);
var debug = require('debug');




// TODO: database
PouchDB.debug('*');
var db = new PouchDB(config.db.local || 'http://localhost:5984/passbookmanager');

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


// TODO: Program
var program = {
	log: debug('jps:passbook'),
	getLogger: function(name){
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
//	__dirname + path.sep + 'routes' + path.sep + 'jps-passbook-sockets',
	__dirname + path.sep + 'routes' + path.sep + 'jps-passbook-routes'
];


console.log('\n\n');

// TODO: Load routes
middleware.forEach(function(m) {
	require(m)(program, app);
});

var logs = [];

//Enable logging before everything
/*
var intercept = require("intercept-stdout");

var intercept_func = intercept(function(data) {
	logs.push({
		msg: data
	});
	if (io) {
		io.emit('newlog', [{
			msg: data
		}]);
	}
});*/

io.on('connection', function(socket) {
	socket.emit('newlog', logs);
});

//Start the server
server.listen(port, function() {

	program.log('listen', port);
	program.log(config.message + ' running @: ' + host + ':' + port);
});
