'use strict';
var fs = require('fs-extra'),
	async = require('async'),
	path = require('path'),
	assert = require('assert'),
	debug = require('debug'),
	logger = debug('jps:passbook');

var db = new require('./db').FileDataStore('data');
var config = require(path.resolve(__dirname, '../config.json'));


var jpsPasskit = function (options) {

};


/**
 * I handle signing a pass with signpass bin.
 * @param pathToPass
 */
function signPass(pathToPass, mode) {
	return new Promise(function (resolve, reject) {

		var cmd = [
			path.resolve(__dirname, '../bin/signpass'),
			mode || '-p',
			pathToPass
		].join(' ');

		logger('signPass - file', pathToPass);
		logger('signPass - cmd', cmd);

		var exec = require('child_process').exec, child;

		child = exec(cmd, function (error, stdout, stderr) {

			logger('stdout: ' + stdout);
			logger('stderr: ' + stderr);
			if (error !== null) {
				logger('exec error: ' + error);
				reject(error);
			} else {
				resolve(stdout || stderr);
			}
		});
		child.on('disconnect', function () {
			logger('disconnected');
		});
	});
}

/**
 * I handle exporting a pass from object to a .json file.
 * @param passFile
 * @param passContent
 * @returns {*}
 */
function exportPass(passFile, passContent) {
	return new Promise(function (resolve, reject) {
		var passFilename = path.normalize(passFile);
		passFilename = passFilename.replace(/\W/g, '');

		logger('exportPass', passFilename);

		assert(passFile, 'has passFile');
		assert(passContent, 'has conent');
		assert(passFilename, 'has filename');

		fs.ensureFileSync(passFilename);

		//Write pass.json
		fs.writeFile(passFilename, JSON.stringify(passContent), function (err) {

			if (err) {
				logger('exportPass - error', err);
				reject(err);
			} else {

				logger('exportPass - success', passFilename);

				resolve(passFilename);
			}
		});
	});

}

/**
 * Validate the contents of a signed pass
 * @param pathToPass
 * @returns {*}
 */
function validatePass(pathToPass) {
	logger('validatePass', pathToPass);

	assert.ok(fs.existsSync(pathToPass));
	return exportPass(pathToPass, '-v');
}



function copyAssets(type, dest, callback) {
	try {
		fs.copySync(path.resolve(__dirname, '../templates/' + type + '.raw/'), dest);
		if (callback) {
			callback(null, dest);
		}
	} catch (err) {
		console.error('Oh no, there was an error: ' + err.message)
		callback(err, null);
	}
}

/**
 * I handle creating the pass.raw folder and writing the pass.json file into it.
 *
 * Based on the pass type copy all files from templates dir
 *
 * @param localPath
 * @param pass
 */
function createPass(pass) {
	return new Promise(function (resolve, reject) {
		var passName = pass.passTypeIdentifier + '-' + pass.description;
		passName = passName.replace(/\W/g, '-');
		var passPath = path.resolve(__dirname, '../', config.dataPath, './passes', `./${passName}.raw`);

		console.log('createPass - path', passPath);

		fs.ensureDirSync(passPath);

		assert(passPath, 'has path');
		assert(pass.type, 'has pass type');

		copyAssets(pass.type, passPath);

		db.put(pass).then(function(resp){
			fs.writeFile(path.resolve(passPath, './pass.json'), JSON.stringify(pass), function (err) {
				if (err) {
					reject(err);
				}

				logger('writeFile', passPath);
				pass.directory = path.dirname(passPath);
				pass.filename = path.resolve(passPath);
				resolve(pass);
			});
		}).catch(reject);

	});
}


module.exports = {
	sign: signPass,
	signPass: signPass,
	export: exportPass,
	exportPass: exportPass,
	validatePass: validatePass,
	createPass: createPass
};
