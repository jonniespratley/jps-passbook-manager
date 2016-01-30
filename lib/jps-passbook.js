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

	function getPassCerts(id, callback) {
		db.find({
			docType: 'pass-type-id',
			passTypeIdentifier: id
		}).then(function(resp) {
			callback(null, _(resp).first());
		}).catch(function(err) {
			callback(err, null);
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
		getPassCerts(pass.passTypeIdentifier, function(err, _certs) {
			console.log('got certs', _certs);
			options.cert = _certs.cert;
			options.key = _certs.key;
			options.passphrase = _certs.passphrase;
			options.passFilename = pass.filename;

			logger('sign pass with', _certs);
			callback(err, pass);
			/*
						signpass = new SignPass(options);
						signpass.sign(function(err, resp) {
							callback(err, resp);
						});*/
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

		logger('validatePass', pathToPass, passDir);

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

				//4. Validate
				/*
				function(_pass, callback) {
					logger('validatePass', '4.');
					validatePass(_pass, callback);
				},*/
				//5. sign
				function(_pass, callback) {
					logger('sign', '4');
					signPass(_pass, callback);
				},
				function(_pass, callback) {
					logger('createPass', '4. Save to database');
					savePass(_pass, callback);
				}
			],
			function(err, results) {


				// results is now equal to: {one: 1, two: 2}
				//logger('createPass - results', err, results);
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
		logger('savePass', pass);
		db.put(pass).then(function(resp) {
			callback(null, resp);
		}).catch(function(err) {
			callback(err, null);
		});
	}


	return {
		getPassCerts: getPassCerts,
		signPass: signPass,

		validatePass: validatePass,
		createPass: createPass
	};

};
