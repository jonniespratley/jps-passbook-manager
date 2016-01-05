/**
 * @author Jonnie Spratley, AppMatrix
 * @created 02/26/13
 */
'use strict';
const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');

const config = require(path.resolve(__dirname, './config.js'));
const port = process.env.PORT || config.server.port || null;
const host = process.env.VCAP_APP_HOST || process.env.IP || config.server.hostname || '127.0.0.1';


var program = require('./lib/program')(config);
var logger = program.getLogger('server');
logger('starting...');


program.log('env', process.env);


var app = express();
logger('created app');

app.use('/', serveStatic(path.resolve(__dirname, config.staticDir)));
app.use('/public', serveStatic(path.resolve(__dirname, config.publicDir)));
logger('serveStatic', config.staticDir, config.publicDir);
program.app = app;

var middleware = [
	path.resolve(__dirname, './routes/jps-passbook-routes')
];
middleware.forEach(function (m) {
	logger('add middleware', m);
	require(m)(program, app);
});

app.listen(port, host, function () {
	logger('listening on', host + ':' + port);
});
