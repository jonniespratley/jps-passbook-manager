'use strict';

module.exports = function(program, app) {
	const intercept = require('intercept-stdout');
	const _ = require('lodash');
	var logger = program.getLogger('web-sockets');

	if (!program) {
		throw new Error('Must provide a program as argument 1');
	}
	if (!app) {
		throw new Error('Must provide an express app as argument 2');
	}

	/*
		const io = require('socket.io').listen(program.server);
		var socket = null;
		io.on('connection', function (_socket) {
			socket = _socket;
			socket.emit('newlog', logs);
		});
	*/
	var expressWs = require('express-ws')(app);
	var app = expressWs.app;

	var logs = [];
	var log = {};


	app.use(function(req, res, next) {
		logger(req.method, req.params, req.url);
		req.testing = 'testing';
		return next();
	});


	app.ws('/a', function(ws, req) {
		logger('/a');
	});

	app.ws('/logs', function(ws, req) {
		var intercept_func = intercept(function(data) {
			var logWss = expressWs.getWss('/logs');
			log = {
				data: data
			};
			if (ws) {

				logWss.clients.forEach(function(client) {
					client.send(JSON.stringify(log));
				})

			}
		});
	});



	var aWss = expressWs.getWss('/a');


	app.ws('/b', function(ws, req) {});

	setInterval(function() {
		aWss.clients.forEach(function(client) {
			logger('send', client);
			client.send(JSON.stringify(program.config.defaults));
		});
	}, 5000);


};
