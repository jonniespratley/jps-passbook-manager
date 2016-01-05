'use strict';

var fs = require('fs-extra'),
	async = require('async'),
	path = require('path'),
	assert = require('assert'),
	debug = require('debug');
module.exports = function (program) {

	let logger = debug('jps:Passkit');
	let db = program.db;
	let config = program.config.defaults;

	/**
	 * I handle signing a pass with signpass bin.
	 * @param pathToPass
	 */
	function signPass(pathToPass, mode) {
		return new Promise(function (resolve, reject) {
			var exec = require('child_process').exec,
				child;
			var pkpassFilename = pathToPass.replace('.raw', '.pkpass');
			var cmd = [
				path.resolve(__dirname, '../bin/signpass'),
				mode || '-p',
				pathToPass
			].join(' ');
			logger('signPass - file', pathToPass);
			logger('signPass - cmd', cmd);

			child = exec(cmd, function (error, stdout, stderr) {
				logger('stdout: ' + stdout);
				logger('stderr: ' + stderr);
				if (error !== null) {
					logger('exec error: ' + error);
					reject(error);
				} else {
					resolve(pkpassFilename);
				}
			});
			child.on('disconnect', function () {
				logger('disconnected');
			});
		});
	}


	/**
	 * Validate the contents of a signed pass
	 * @param pathToPass
	 * @returns {*}
	 */
	function validatePass(pass) {
		let pathToPass = pass.filename;
		logger('validatePass', pathToPass);
		return signPass(pathToPass, '-v');
	}


	function copyAssets(type, dest, callback) {
		logger('copyAssets', dest);
		var templatesDir = path.resolve(__dirname,
			'../templates/' + type + '.raw/'
		);
		try {
			fs.ensureDirSync(dest);
			fs.copySync(templatesDir, dest);

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
	function createPass(pass, sign) {
		return new Promise(function (resolve, reject) {

			//assert(passPath, 'has path');
			//	assert(pass.type, 'has pass type');

			logger('writing pass.json');


			// an example using an object instead of an array
			async.waterfall([
					function (callback) {
						let passName = pass.serialNumber;
						passName = passName.replace(/\W/g, '-');

						let passPath = path.resolve(
							__dirname,
							'../',
							config.dataPath,
							'./passes/',
							//	pass.passTypeIdentifier,
							`./${passName}.raw`);

						logger('createPass', '=========================', pass.type);
						logger('passName', passName);
						logger('passPath', passPath);

						callback(null, pass.type, passPath);
					},
					function (_type, _path, callback) {
						copyAssets(_type, _path, callback);
					},
					function (_path, callback) {
						let passJsonPath = path.resolve(_path, './pass.json');
						let passPath = _path;
						fs.writeFile(passJsonPath, JSON.stringify(pass), function (err) {
							if (err) {
								reject(err);
							}

							pass.directory = path.dirname(passPath);
							pass.filename = path.resolve(passPath);
							pass.rawFilename = path.resolve(passPath);

							logger('wrote', pass.filename);
							logger('createPass - complete');
							callback(null, pass);
						});
					},
					function (_pass, callback) {
						savePass(_pass, sign).then(function (_p) {
							callback(null, _p);
						}, function (err) {
							callback(err, null);
						});
					}
				],
				function (err, results) {
					// results is now equal to: {one: 1, two: 2}
					logger(err, results);
					if (err) {
						reject(err);
					} else {
						resolve(results);
					}
				});


		});
	}

	/**
	 * Save pass to data store.
	 * @param pass
	 * @param sign
	 * @returns {*}
	 */
	function savePass(pass, sign) {
		if (sign) {
			return signPass(pass.filename).then(function (pathToPass) {
				pass.pkpassFilename = pathToPass;
				return db.put(pass);
			});

		} else {
			return db.put(pass);
		}

	}


	return {
		signPass: signPass,

		validatePass: validatePass,
		createPass: createPass
	};

};
