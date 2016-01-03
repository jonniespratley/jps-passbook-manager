'use strict';
var fs = require('fs-extra'),
	path = require('path'),
	assert = require('assert'),
	debug = require('debug'),
	logger = debug('jps:passbook');

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
		var passFilename = path.resolve(__dirname, passFile);
		passFilename = passFilename.replace(/\W/, '');

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

function validatePass(pathToPass){
	logger('validatePass', pathToPass);
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
function createPass(localPath, pass) {
	return new Promise(function (resolve, reject) {
		var passPath = path.resolve(localPath + path.sep + pass.description + '.raw');

		//logger('createPass', pass);
		logger('createPass - path', passPath);

		assert(passPath, 'has path');


		copyAssets(pass.type || 'Coupon', passPath);

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


var Pass = function (obj) {
	return {
		_id: "pass-" + Date.now(),
		"docType": "pass",
		"formatVersion": 1,
		"passTypeIdentifier": "pass.passbookmanager.io",
		"serialNumber": "E5982H-I2",
		"teamIdentifier": "USE9YUYDFH",
		"webServiceURL": config.webServiceURL,
		"authenticationToken": "00000000001234",
		"barcode": {
			"message": "123456789",
			"format": "PKBarcodeFormatQR",
			"messageEncoding": "iso-8859-1"
		},
		"locations": [{
			"longitude": -122.3748889,
			"latitude": 37.6189722
		}],
		"organizationName": "Coupon",
		"logoText": "Logo",
		"description": "20% off any products",
		"foregroundColor": "#111",
		"backgroundColor": "#222",
		"coupon": {
			"primaryFields": [{
				"key": "offer",
				"label": "Any premium dog food",
				"value": "20% off"
			}],
			"auxiliaryFields": [{
				"key": "starts",
				"label": "STARTS",
				"value": "Feb 5, 2013"
			}, {
				"key": "expires",
				"label": "EXPIRES",
				"value": "March 5, 2012"
			}],
			"backFields": [{
				"key": "terms",
				"label": "TERMS AND CONDITIONS",
				"value": "Generico offers this pass, including all information, software, products and services available from this pass or offered as part of or in conjunction with this pass (the \"pass\"), to you, the user, conditioned upon your acceptance of all of the terms, conditions, policies and notices stated here. Generico reserves the right to make changes to these Terms and Conditions immediately by posting the changed Terms and Conditions in this location.\n\nUse the pass at your own risk. This pass is provided to you \"as is,\" without warranty of any kind either express or implied. Neither Generico nor its employees, agents, third-party information providers, merchants, licensors or the like warrant that the pass or its operation will be accurate, reliable, uninterrupted or error-free. No agent or representative has the authority to create any warranty regarding the pass on behalf of Generico. Generico reserves the right to change or discontinue at any time any aspect or feature of the pass."
			}]
		}
	}
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
