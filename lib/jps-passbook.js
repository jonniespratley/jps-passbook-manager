'use strict';

var fs = require('fs-extra'),
	async = require('async'),
	glob = require('glob'),
	path = require('path'),
	Pass = require('./models/pass'),
	assert = require('assert'),
	_ = require('lodash'),
	child_process = require('child_process'),
	debug = require('debug');

module.exports = function(program) {
	var utils = program.utils;
	let logger = program.getLogger('passbook');
	let db = program.db;
	let config = program.config.defaults;
	const SignPass = program.require('signpass');

	function getPassCerts(id) {
		return new Promise(function(resolve, reject) {
			db.find({
				docType: 'pass-type-id',
				passTypeIdentifier: id
			}).then(function(resp) {
				resolve(_(resp).first());
			}).catch(function(err) {
				reject(err);
			});
		});
	}

	// TODO: Save pass Type id to database, and create pems.
	function savePassTypeIdentifier(obj) {
		let outputPath = path.resolve(program.config.defaults.dataPath, './', obj.passTypeIdentifier, './certs');
		fs.ensureDirSync(outputPath);
		logger('savePassTypeIdentifier', outputPath);

		return new Promise(function(resolve, reject) {
			logger('savePassTypeIdentifier', obj);
			if (!obj.cert) {
				reject({
					error: 'Must provide path to .p12 certificate'
				});
			}

			SignPass.createPems(obj.passTypeIdentifier, obj.cert, obj.passphrase, outputPath, function(err, resp) {
				if (err) {
					reject(err);
				}
				logger('createPems', resp._id);
				program.db.put(resp).then(resolve, reject);

				//assert(fs.existsSync(options.key));
				//assert(fs.existsSync(options.cert));
				//resolve(resp);
			});
		});
	}

	// TODO: Save upload to database and move to data directory
	function saveUpload(file) {
		return new Promise(function(resolve, reject) {
			var toFilename = path.resolve(program.config.defaults.dataPath, './uploads/' + file.originalFilename);
			var _doc = {
				_id: 'file-' + file.name,
				originalFilename: file.originalFilename,
				path: toFilename,
				size: file.size,
				name: file.name,
				type: file.type
			};
			logger('saveUpload', _doc);
			fs.copy(file.path, _doc.path, function(err) {
				if (err) {
					reject(err);
				}
				program.db.put(_doc).then(resolve, reject);
			});
		});
	}

	/**
	 * I handle signing a pass with signpass bin.
	 Fetch pass certs from db and use signPass

	 * @param pathToPass
	 */
	function signPass(pass, callback) {
		logger('signPass', pass.filename);
		assert(pass.filename, 'has filename');
		var signpass = null;
		var options = {
			passFilename: null,
			cert: null,
			passphrase: null,
			key: null,
			wwdr: null,
			outputFilename: null,
			compress: true
		};

		// TODO: SignPass instance using cert info
		getPassCerts(pass.passTypeIdentifier).then(function(_certs) {
			logger('getPassCerts', _certs._id);

			options.cert = _certs.cert;
			options.key = _certs.key;
			options.passphrase = _certs.passphrase;
			options.passFilename = pass.filename;

			logger('sign pass with', _certs.cert);
			//	callback(err, pass);

			if (!options.filename) {
				callback('No pass filename for pass ' + pass._id, null);
			} else {


				signpass = new SignPass(options);
				signpass.sign(function(err, resp) {
					callback(err, resp);
				});

			}

		}).catch(function(err) {
			callback(err, null);
		});
	}

	/**
	 * Validate the contents of a signed pass
	 * @param pathToPass
	 * @returns {*}
	 */
	function validatePass(pass, callback) {
		let pathToPass = pass.filename;
		let passDir = path.resolve(pathToPass, './');

		logger('validatePass', pathToPass);

		let files = fs.readdirSync(passDir);
		let manifest = {};
		let _manifest = {};
		let _dsStoreFilename = path.resolve(passDir, './.DS_Store');
		let _manifestFilename = path.resolve(passDir, './manifest.json');

		glob(passDir + '/**/*.*', function(err, files) {
			logger('validatePass', 'files', files);
			if (err) {
				callback(err, null)
			}

			let _done = _.after(files.length, function() {
				fs.writeFile(_manifestFilename, JSON.stringify(_manifest), function(err) {
					logger('generate_json_manifest', 'wrote to', _manifestFilename);
					fs.removeSync(_dsStoreFilename);
					callback(null, _manifest);
				});
			});

			_.forEach(files, function(file) {
				logger('checksum', file);
				_manifest[file.replace(passDir + path.sep, '')] = utils.checksum(fs.readFileSync(file), 'sha1');
				_done();
			});
		});
	}

	/**
	 * @description Copy pass assets from ./templates dir to pass destination.
	 */
	function copyAssets(type, dest, callback) {
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

						config.dataPath,
						pass.passTypeIdentifier,
						'./passes/',
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
					logger('createPass', 'writeFile', passJsonPath);
					fs.writeFile(passJsonPath, JSON.stringify(pass), function(err) {
						pass.directory = path.dirname(passPath);
						pass.filename = path.resolve(passPath);
						pass.rawFilename = path.resolve(passPath);
						pass.pkpassFilename = path.resolve(passPath).replace('.raw', '.pkpass');
						callback(err, pass);
					});
				},

				//4. Validate
				/*
				function(_pass, callback) {
					logger('validatePass', '4.');
					validatePass(_pass, callback);
				},*/

				//4. sign
				function(_pass, callback) {
					logger('sign', '4. Sign Pass');
					signPass(_pass, callback);
				},

				//5. Save
				function(_pass, callback) {
					logger('createPass', '5. Save to database');
					savePass(_pass, callback);
				}
			],
			function(err, results) {
				logger('createPass', '============================= complete');
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
		logger('savePass', pass._id);
		db.put(pass).then(function(resp) {
			callback(null, resp);
		}).catch(function(err) {
			callback(err, null);
		});
	}

	return {
		savePassTypeIdentifier: savePassTypeIdentifier,
		getPassCerts: getPassCerts,
		signPass: signPass,
		validatePass: validatePass,
		createPass: createPass
	};
};
