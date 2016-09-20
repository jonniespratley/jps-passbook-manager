'use strict';

const fs = require('fs-extra');
const async = require('async');
const glob = require('glob');
const path = require('path');
const Pass = require('./models/pass');
const assert = require('assert');
const _ = require('lodash');
const child_process = require('child_process');
const debug = require('debug');

/**
 * jpsPassbook contains methods for creating/validating/signing passes.
 * @class program
 * @param program
 * @returns {{
 * savePassTypeIdentifier: savePassTypeIdentifier,
 * savePassTypeIdentifierPromise: savePassTypeIdentifierPromise,
 * getPassTypeIdentifier: getPassTypeIdentifier,
 * getPassCerts: getPassCerts,
 * signPass: signPass,
 * validatePass: validatePass,
 * createPass: createPass,
 * batchPromise: batchPromise,
 * createPassPromise: createPassPromise,
 * signPassPromise: signPassPromise,
 * validatePassPromise: validatePassPromise
 * }}
 */
module.exports = function jpsPassbook(program) {
	var utils = program.utils;
	let logger = program.getLogger('passbook');
	let db = program.db;
	let config = program.config.defaults;
	const SignPass = program.require('signpass');

	/**
	 * I handle getting the certificates for a pass.
	 * @param id
	 * @param cb
	 * @returns {*}
	 */
	function getPassCerts(id, cb) {
		return new Promise(function(resolve, reject) {
			db.findOne({
				docType: 'pass-type-id',
				passTypeIdentifier: id
			}).then(function(resp) {
				cb(null, resp);
			}).catch(function(err) {
				cb(err);
			});
		});
	}

	/**
	 * I handle saving a pass type id to database and create pems.
	 * @param obj
	 * @param cb
	 * @returns {*}
	 */
	function savePassTypeIdentifier(obj, cb) {
		let outputPath = path.resolve(program.config.defaults.dataPath, './', '');
		fs.ensureDirSync(outputPath);
		obj.wwdr = obj.wwdr || path.resolve(__dirname, '../certificate/wwdr-authority.pem');

		logger('savePassTypeIdentifier', 'outputPath', outputPath);
		logger('savePassTypeIdentifier', 'passed', obj);

		if (!obj.p12) {
			return cb({
				error: 'Must provide path to .p12 certificate'
			});
		} else if (!obj.passphrase) {
			return cb({
				error: 'Must provide passphrase to .p12 certificate'
			});
		}

		SignPass.createPems({
			output: outputPath,
			wwdr: obj.wwdr,
			passTypeIdentifier: obj.passTypeIdentifier,
			passphrase: obj.passphrase,
			p12: obj.p12
		}, function(err, resp) {
			if (err) {
				cb(err, null);
			}
			logger('createPems', 'success', resp._id);
			program.db.put(resp).then(function(o) {
				if (cb) {
					cb(null, o);
				}

			}).catch(function(err) {
				if (cb) {
					cb(err);
				}
			});
		});
	}

	/**
	 * I handle saving the pass type identifier.
	 * @param obj
	 * @returns {*}
	 */
	function savePassTypeIdentifierPromise(obj) {
		return new Promise(function(resolve, reject) {
			savePassTypeIdentifier(obj, function(err, resp) {
				if (err) {
					reject(err);
				}
				resolve(resp);
			});
		});
	}

	/**
	 * I handle saving a upload to database and move to data directory
	 * @param file
	 * @returns {*}
	 */
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
	 * I handle signing a .raw pass with signpass bin.
	 * Fetch pass certs from db and use signPass\
	 * Fetch pass info from pass.json file instead of db.
	 * @param pass
	 * @param callback
	 */
	function signPass(pass, callback) {
		pass = new Pass(pass);
		let signpass = null;
		let _passFilename = pass.filename || path.resolve(
			program.config.defaults.dataPath, `./${pass.passTypeIdentifier}/passes/${pass._id}.raw`);
		let options = {
			passFilename: null,
			cert: null,
			passphrase: null,
			key: null,
			wwdr: null,
			outputFilename: null,
			compress: true
		};

		logger('signPass');
		logger('signPass', 'pass', pass._id);
		logger('signPass', 'filename', pass.filename);

		//	assert(pass.rawFilename, 'has rawFilename');

		// TODO: SignPass instance using cert info
		getPassCerts(pass.passTypeIdentifier, function(err, _certs) {
			logger('getPassCerts', _certs._id);
			if (err) {
				callback(err);
			}
			_certs.outputFilename = _passFilename.replace('.raw', '.pkpass');
			_certs.passFilename = pass.filename || pass.rawFilename || _passFilename;

			logger('signPass', 'certs', _certs.cert);
			//		logger('sign pass options', _certs);
			//	callback(null, pass);
			signpass = new SignPass(_certs);
			signpass.signPromise().then(function(resp) {
				logger('signPass', 'success', resp);
				pass.pkpassFilename = resp.dest;
				savePass(pass, function(err, p) {
					callback(err, resp);
				});
			}).catch(function(err) {
				callback(err);
			});

		});
	}

	/**
	 * Validate the contents of a signed pass
	 */
	function validatePass(pass, callback) {
		let _passFilename = pass.filename || pass.rawFilename || path.resolve(program.config.defaults.dataPath,
			`./${pass.passTypeIdentifier}/passes/${pass._id}.raw`);
		let pathToPass = _passFilename;
		let passDir = path.resolve(pathToPass, './');
		let files = fs.readdirSync(passDir);
		let manifest = {};
		let _manifest = {};
		let _dsStoreFilename = path.resolve(passDir, './.DS_Store');
		let _manifestFilename = path.resolve(passDir, './manifest.json');


		logger('validatePass', pathToPass);

		glob(passDir + '/**/*.*', function(err, files) {
			logger('validatePass', 'files', files);
			if (err) {
				callback(err)
			}

			let _done = _.after(files.length, function() {
				fs.writeFile(_manifestFilename, JSON.stringify(_manifest), function(err) {
					if (err) {
						callback(err)
					}
					logger('generate_json_manifest', 'writing', _manifestFilename);
					fs.remove(_dsStoreFilename, function() {
						callback(null, pass);
					});

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
	 * Copy pass assets from ./templates dir to pass destination.
	 * @param type
	 * @param dest
	 * @param callback
	 */
	function copyAssets(type, dest, callback) {
		let templatesDir = path.resolve(__dirname, '../templates/' + type + '.raw/');

		logger('copyAssets', 'from', templatesDir);
		logger('copyAssets', 'to', dest);
		fs.ensureDir(dest, function(err) {
			if (err) {
				callback(err);
			}
			fs.copy(templatesDir, dest, function(err) {
				if (err) {
					callback(err);
				}
				if (callback) {
					callback(null, dest);
				}
			});
		});

	}

	/**
	 * I handle creating the pass.raw folder and writing the pass.json file into it.
	 * @param pass
	 * @param cb
	 * @returns {*}
	 */
	function createPass(pass, cb) {
		logger('createPass', '============================= start');

		let _pass = new Pass(pass);
		let passName = pass._id;

		return async.waterfall([

				//1. Build filenames
				function(callback) {
					logger('createPass', '1. Build file names');
					passName = passName.replace(/\W/g, '-');
					passName = passName.replace(' ', '-');

					let passPath = path.resolve(config.dataPath,
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
						if (err) {
							callback(err);
						}
						pass.filename = path.resolve(passPath);
						pass.rawFilename = path.resolve(passPath);
						callback(null, pass);
					});
				},

				//4. Validate
				function(_pass, callback) {
					logger('validatePass', '4.');
					validatePass(_pass, callback);
				},

				/* */
				//4. sign
				function(_pass, callback) {
					logger('sign', '4. Sign Pass');
					//	signPass(_pass, callback);
					callback(null, _pass);
					//callback(null, )
				},


				//5. Save
				function(_pass, callback) {
					logger('createPass', '5. Save to database');
					savePass(_pass, callback);
				}
			],
			function(err, resp) {
				logger('createPass', '============================= complete');
				if (err) {
					cb(err);
				}
				cb(null, resp);
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
		program.db.put(pass).then(function(resp) {
			logger('savePass', 'success', resp._id);
			callback(null, resp);
		}).catch(function(err) {
			logger('savePass', 'error', err);
			callback(err);
		});
	}

	return {
		savePassTypeIdentifier: savePassTypeIdentifier,
		savePassTypeIdentifierPromise: savePassTypeIdentifierPromise,
		getPassTypeIdentifier: function(id) {
			return new Promise(function(resolve, reject) {
				getPassCerts(id, function(err, resp) {
					if (err) {
						reject(err);
					} else {
						resolve(resp);
					}
				});
			});
		},
		getPassCerts: getPassCerts,
		signPass: signPass,
		validatePass: validatePass,
		createPass: createPass,
		batchPromise: function(action, passes) {
			return new Promise(function(resolve, reject) {
				//	let passes = [];
				let _resp = [];
				let _done = _.after(passes.length, function() {
					resolve(_resp);
				});

				let _doBatch = function(_pass) {
					switch (action) {
						case 'create':
							createPass(_pass, function(err, p) {
								if (err) {
									console.error(err);
									_done();
								}
								_resp.push(p);
								_done();
							});
							break;
						case 'sign':
							signPass(_pass, function(err, p) {
								if (err) {
									console.error(err);
									_done();
								}
								_resp.push(p);
								_done();
							});
							break;
						case 'validate':
							validatePass(_pass, function(err, p) {
								if (err) {
									console.error(err);
									_done();
								}
								_resp.push(p);
								_done();
							});
							break;
						default:

							break;
					}
				};

				_.forEach(passes, function(_pass) {
					logger('batch', action, _pass);
					_.defer(function() {
						_doBatch(_pass);
					});
				});
			});
		},
		createPassPromise: function(pass) {
			return new Promise(function(resolve, reject) {
				createPass(pass, function(err, resp) {
					if (err) {
						reject(err);
					}
					resolve(resp);
				});
			});
		},
		signPassPromise: function(pass) {
			return new Promise(function(resolve, reject) {
				signPass(pass, function(err, resp) {
					if (err) {
						reject(err);
					}
					resolve(resp);
				});
			});
		},
		validatePassPromise: function(pass) {
			return new Promise(function(resolve, reject) {
				validatePass(pass, function(err, resp) {
					if (err) {
						reject(err);
					}
					resolve(resp);
				});
			});
		}
	};
};
