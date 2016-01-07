'use strict';

var fs = require('fs-extra'),
	async = require('async'),
	path = require('path'),
	assert = require('assert'),
	debug = require('debug');
module.exports = function(program) {

	let logger = program.getLogger('passbook');
	let db = program.db;
	let config = program.config.defaults;

	/**
	 * I handle signing a pass with signpass bin.
	 * @param pathToPass
	 */
	function signPass(pathToPass, mode, callback) {

			var exec = require('child_process').exec,
				child;
			var pkpassFilename = pathToPass.replace('.raw', '.pkpass');
			var cmd = [
				path.resolve(__dirname, '../bin/signpass'),
				mode || '-p',
				pathToPass
			].join(' ');

			logger('signPass', 'file', pathToPass);
			logger('signPass', 'cmd', cmd);

			child = exec(cmd, function(error, stdout, stderr) {
				logger('signPass', 'stdout: ' + stdout);
				logger('signPass', 'stderr: ' + stderr);

				if (error !== null) {
					logger('exec error: ' + error);
					//reject(error);
					callback(error, null)
				} else {
					callback(pkpassFilename);
				}
			});

			child.on('close', function() {
				logger(child.pid, 'close');
			});
			child.on('error', function() {
				logger(child.pid, 'error');
			});

	}


	/**
	 * Validate the contents of a signed pass
	 * @param pathToPass
	 * @returns {*}
	 */
	function validatePass(pass, callback) {
		let pathToPass = pass.filename;
		logger('validatePass', pathToPass);
		return signPass(pathToPass, '-v', callback);
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
		logger('createPass', '============================= start ==========================');

			return async.waterfall([

					//1. Build filenames
					function(callback) {
						logger('createPass', '1. Build filenames');

						let passName = pass.serialNumber;
						passName = passName.replace(/\W/g, '-');

						let passPath = path.resolve(
							__dirname,
							'../',
							config.dataPath,
							'./passes/',
							//	pass.passTypeIdentifier,
							`./${passName}.raw`);

						logger('createPass', 'passType =', pass.type);
						logger('createPass', 'passName =', passName);
						logger('createPass', 'passPath =', passPath);

						callback(null, pass.type, passPath);
					},

					//2. Copy assets
					function(_type, _path, callback) {
						logger('createPass', '2. Copy assets');
						copyAssets(_type, _path, callback);
					},

					//3. Create pass.json
					function(_path, callback) {

						let passJsonPath = path.resolve(_path, './pass.json');
						let passPath = _path;

						logger('createPass', '3. Create pass.json');
						logger('createPass', 'passJsonPath =', passJsonPath);

						fs.writeFile(passJsonPath, JSON.stringify(pass), function(err) {

							pass.directory = path.dirname(passPath);
							pass.filename = path.resolve(passPath);
							pass.rawFilename = path.resolve(passPath);

							logger('createPass', 'rawFilename =', pass.rawFilename);
							logger('createPass', 'directory =', pass.directory);
							logger('createPass', 'filename =', pass.filename);


							callback(err, pass);
						});
					},

					//4. Save to database
					function(_pass, callback) {
						logger('createPass', '4. Save to database');
						savePass(_pass, sign, callback);
					}
				],
				function(err, results) {

					// results is now equal to: {one: 1, two: 2}
					logger( 'createPass - results', err, results);
					logger('createPass', '============================= complete ==========================');
					callback(err, results);
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
			return signPass(pass.filename).then(function(pathToPass) {
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
