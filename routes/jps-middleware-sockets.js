'use strict';

module.exports = function (program, app) {
	const intercept = require('intercept-stdout');

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

	app.use(function (req, res, next) {
		program.log('sockets -', req.method, req.params, req.url);
		req.testing = 'testing';
		return next();
	});

	var expressWs = require('express-ws')(app);
	var logs = [];
	app.ws('/echo', function(ws, req) {
		ws.on('message', function(msg) {
			if(ws){
				ws.send(msg);
			}
		});
	});

	app.ws('/', function(ws, req) {
		ws.on('message', function(msg) {
			console.log(msg);
		});
		console.log('socket', req.testing);
	});



	app.ws('/logs', function (ws, req) {

		//Enable logging before everything
		var intercept_func = intercept(function (data) {
			logs.push({
				msg: data
			});
			if (ws) {
				ws.send('newlog', [{
					msg: data
				}]);
			}
		});
		ws.on('message', function (msg) {
			//console.log(msg);
		});
	});


};
