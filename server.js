/**
 * @author Jonnie Spratley, AppMatrix
 * @created 02/26/13
 */
'use strict';
const path = require('path');
const Program = require('./lib/program');

let config = require(path.resolve(__dirname, './config.js'));
const port = process.env.PORT || config.server.port || null;
const host = process.env.VCAP_APP_HOST || process.env.IP || config.server.hostname || '127.0.0.1';

let program = new Program(config);
let logger = program.getLogger('server');


var routes = [
	path.resolve(__dirname, './lib/routes/api'),
	//	path.resolve(__dirname, './lib/routes/admin'),
	//path.resolve(__dirname, './lib/routes/auth')
];


logger('env', process.env);
logger('config', config);

program.mount(routes).listen(port, host, function() {
	logger('listening on', host + ':' + port);
});
