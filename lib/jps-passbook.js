'use strict';
var fs = require('fs-extra'),
	async = require('async'),
	path = require('path'),
	assert = require('assert'),
	debug = require('debug'),
	logger = debug('jps:passbook');

var db = new require('./db').FileDataStore('data/passes');
var config = require(path.resolve(__dirname, '../config.json'));


var jpsPasskit = function(options){
	
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
		})
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
		passFilename = passFilename.replace(/\d/g, '');

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
				var msg = passFilename + ' was exported';
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
function validatePass(pathToPass){
	logger('validatePass', pathToPass);

	assert.ok(fs.existsSync(pathToPass));
	return exportPass(pathToPass, '-v');
}

/**
 * I handle reading the contents of a file.
 * @param localPath
 * @param mimeType
 * @param res
 */
function getFile(localPath, mimeType, res) {
	fs.readFile(localPath, function (err, contents) {
		if (!err) {
			res.writeHead(200, {
				"Content-Type": mimeType,
				"Content-Length": contents.length
			});
			res.end(contents);
		} else {
			res.writeHead(500);
			res.end();
		}
	});
}

/**
 * I handle writing contents to a file
 * @param localPath
 * @param contents
 * @param callback
 */
function writeFile(localPath, contents, callback) {
	var stream = fs.createWriteStream(localPath);
	logger('writeFile', localPath);
	stream.on("open", function () {

		stream.end(contents, 'utf-8');
		callback({
			directory: path.dirname(localPath),
			filename: path.basename(localPath),
			name: localPath,
			contents: contents
		});
	});
}

/**
 * I handle creating a directory.
 * @param localPath
 * @returns {*}
 */
function createDirectory(localPath, callback) {
	logger('creating directory', path.resolve(localPath));

	fs.ensureDir(localPath, function (er) {
		if (er) {
			throw new Error(er, 'Problem creating directory:' + localPath);
		}
		callback(localPath);
	});
}

function checkDirectory(localPath, callback) {
	logger('checking directory', path.resolve(localPath));
	//fs.rmdir(localPath);
	fs.mkdir(localPath, function (er) {
		if (er) {
			throw new Error(er, 'Problem creating directory:' + localPath);
		}
		callback(localPath);
	});
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
		var passName = pass.passTypeIdentifier +'-' + pass.description.replace(' ', '-');
		var passPath = path.resolve( __dirname, '../', config.dataPath, './passes', `./${passName}.raw`);
		logger('createPass - path', passPath);
		
		fs.ensureDirSync(passPath);
		
		//logger('createPass', pass);
		assert(passPath, 'has path');
		assert(pass.type, 'has pass type');
		
		copyAssets(pass.type, passPath);
		
		
		//db.put(pass);

		fs.writeFile(path.resolve(passPath, './pass.json'), JSON.stringify(pass), function (err) {
			if (err) {
				reject(err);
			}

			logger('writeFile', passPath);
			pass.directory = path.dirname(passPath);
			pass.filename = path.resolve(passPath);
			resolve(pass);
		});
	});
}


module.exports = {
	name: 'jps-passbook',
	sign: signPass,
	signPass: signPass,
	export: exportPass,
	exportPass: exportPass,
	validatePass: validatePass,
	createDirectory: createDirectory,
	createPass: createPass
};
