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

const config = require(path.resolve(__dirname, './config.json'));
const port = process.env.PORT || config.server.port || null;
const host = process.env.VCAP_APP_HOST || config.server.hostname || null;

var app = express();
app.use('/', serveStatic(path.resolve(__dirname, './app')));
app.use('/public', serveStatic(path.resolve(__dirname, './www')));

var program = require('./lib/program')(config);
program.app = app;


var middleware = [
	path.resolve(__dirname, './routes/jps-passbook-routes')
];
middleware.forEach(function(m) {
	require(m)(program, app);
});

app.listen(port, host, function() {
	program.log('listen', host, port);
});
