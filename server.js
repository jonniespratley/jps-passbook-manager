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

logger('initialized');
logger('env', process.env);

program.mount().listen(port, host, function() {
	logger('Express Host', app.get('host'));
	logger('Express Port', app.get('port'));
	logger('listening on', host + ':' + port);
});
