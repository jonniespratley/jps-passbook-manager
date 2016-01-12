'use strict';

var fs = require('fs-extra'),
	async = require('async'),
	path = require('path'),
	Pass = require('./models/pass'),
	assert = require('assert'),
	_ = require('lodash'),
	child_process = require('child_process'),
	debug = require('debug');

module.exports = function(program) {

	let logger = program.getLogger('passbook');
	let db = program.db;
	let config = program.config.defaults;

	/**
	 * I handle signing a pass with signpass bin.
	 * @param pathToPass
	 */
	function signPass(pass, mode, callback) {
		mode = '-p';
		logger('signPass', pass);
		assert(pass.filename, 'has filename');
		var pkpassFilename = pass.filename.replace('.raw', '.pkpass');

		var cmd = `${path.resolve(__dirname, '../bin/signpass')} ${mode} ${pass.filename}`;
		logger('signPass', cmd);

		try {
			child_process.execSync(cmd);
		} catch (err) {
			callback(err, null);
		} finally {
			callback(null, pkpassFilename);
		}

	}


	/**
	 * Validate the contents of a signed pass
	 * @param pathToPass
	 * @returns {*}
	 */
	function validatePass(pass, callback) {
		let pathToPass = pass.filename;
		let passDir = path.dirname(pathToPass);

		logger('validatePass', pathToPass);

		let files = fs.readdirSync(passDir);
		let manifest = {};
		let manifestFile = path.resolve(passDir, './manifest.json');
		let items = [];

		logger('files', files);


		return signPass(pass, '-v', callback);
	}


	function copyAssets(type, dest, callback) {
		logger('copyAssets', type);

		let templatesDir = path.resolve(__dirname,
			'../templates/' + type + '.raw/'
		);

		logger('copyAssets', 'from', templatesDir);
		logger('copyAssets', 'to', dest);

		try {

			fs.ensureDirSync(dest);
			fs.copySync(templatesDir, dest);

		} catch (err) {
			logger('copyAssets', 'error', err);
			callback(err, null);
		} finally {

			if (callback) {
				callback(null, dest);
			}

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
	function createPass(pass, cb) {
		var sign = false;
		logger('createPass', '============================= start ==========================');

		return async.waterfall([

				//1. Build filenames
				function(callback) {
					logger('createPass', '1. Build file names');

					let passName = pass._id;

					passName = passName.replace(/\W/g, '-');
					passName = passName.replace(' ', '-');

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
					logger('createPass', 'path =', passJsonPath);

					fs.writeFile(passJsonPath, JSON.stringify(pass), function(err) {

						pass.directory = path.dirname(passPath);
						pass.filename = path.resolve(passPath);
						pass.rawFilename = path.resolve(passPath);
						pass.pkpassFilename = path.resolve(passPath).replace('.raw', '.pkpass');

						//	logger('createPass', 'rawFilename =', pass.rawFilename);
						logger('createPass', 'directory =', pass.directory);
						logger('createPass', 'filename =', pass.filename);


						callback(err, pass);
					});
				},

				//4. Save to database
				function(_pass, callback) {
					logger('createPass', '4. Save to database');
					savePass(_pass, callback);
				}
			],
			function(err, results) {


				// results is now equal to: {one: 1, two: 2}
				//logger('createPass - results', err, results);
				logger('createPass', '============================= complete ==========================');
				if (cb) {
					cb(err, results);
				}

			});
	}

	/**
	 * Save pass to data store.
	 * @param pass
	 * @param sign
	 * @returns {*}
	 */
	function savePass(pass, callback) {
		pass = new Pass(pass);
		logger('savePass', pass);
		db.put(pass).then(function(resp) {
			callback(null, resp);
		}).catch(function(err) {
			callback(err, null);
		});
	}


	return {
		signPass: signPass,

		validatePass: validatePass,
		createPass: createPass
	};

};
