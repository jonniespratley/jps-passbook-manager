/**
 * @author Jonnie Spratley, AppMatrix
 * @created 02/26/13
 */
//## Dependencies
var express = require('express'),
	path = require('path'),
	fs = require('fs-extra');

var port = process.env.PORT || 1333;
var host = process.env.VCAP_APP_HOST || "127.0.0.1";
var config = fs.readJsonSync(__dirname + path.sep + 'config' + path.sep +
	'config.json');

if (process.env.MONGODB_URL) {
	config.db.url = process.env.MONGODB_URL;
	console.warn('changing mongodb url', process.env.MONGODB_URL);
}

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


// TODO: database

// TODO: Using pouchdb
var PouchDB = require('pouchdb');
PouchDB.debug('*');
var db = new PouchDB(config.db.local);
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



var log4js = require('log4js');
var logger = log4js.getLogger();
logger.debug("Some debug messages");




var colors = require('colors/safe');


var customLevels = {
	levels: {
      info: 0,
      debug: 1,
      warn: 2,
      error: 3
    },
	 colors: {
	   silly: 'rainbow',
	   input: 'grey',
	   verbose: 'cyan',
	   prompt: 'grey',
	   info: 'green',
	   data: 'grey',
	   help: 'cyan',
	   warn: 'yellow',
	   debug: 'blue',
	   error: 'red'
	 }
};
// set theme
colors.setTheme(customLevels.colors);

logger.log('silly', "127.0.0.1 - there's no place like home");
logger.log('debug', "127.0.0.1 - there's no place like home");
logger.log('verbose', "127.0.0.1 - there's no place like home");
logger.log('info', "127.0.0.1 - there's no place like home");
logger.log('warn', "127.0.0.1 - there's no place like home");
logger.log('error', "127.0.0.1 - there's no place like home");
logger.info("127.0.0.1 - there's no place like home");
logger.warn("127.0.0.1 - there's no place like home");
logger.error("127.0.0.1 - there's no place like home");

// TODO: Program
var program = {
	log: logger,
	config: {
		defaults: config
	},
	db: db,
	ds: _ds,
	app: app
};


var middleware = [
	__dirname + path.sep + 'routes' + path.sep + 'jps-passbook-sockets',
	__dirname + path.sep + 'routes' + path.sep + 'jps-passbook-routes'
];

// TODO: Load routes
middleware.forEach(function(m) {
	require(m)(program, app);
})



//Enable logging before everything
var intercept = require("intercept-stdout");
var logs = [];
var intercept_func = intercept(function(data) {
	logs.push({
		msg: data
	});
	if (io) {
		io.emit('newlog', [{
			msg: data
		}]);
	}
});

io.on('connection', function(socket) {
	socket.emit('newlog', logs);
});

//Start the server
server.listen(port, function() {
	program.log.debug(config.message + ' running @: ' + host + ':' + port);
});
