'use strict';



var fs = require('fs-extra'),
	path = require('path'),
	assert = require('assert'),
	fsutils = require('fs-utils'),
	debug = require('debug'),
	Q = require('q'),
	logger = debug('jps:passbook'),
	spawn = require('child_process').spawn;

/**
 * I handle signing a pass with signpass bin.
 * @param pathToPass
 */
function signPass(pathToPass, callback) {
	logger('bin/signpass -p ' + pathToPass);
	var signpass = spawn(path.resolve(__dirname, '../bin/signpass'), ['-p', pathToPass]);

	signpass.stdout.on('data', function(data) {
		logger('stdout: ', data);
	});

	signpass.on('error', function(err) {
		logger('signpass process exited with code ', err);
		//throw err;
	});

	signpass.on('close', function(code) {
		if (code !== 0) {
			logger('signpass process exited with code ', code);
		}
		callback(pathToPass.replace('.raw', '.pkpass'));
	});
}

/**
 * I handle exporting a pass from object to a .json file.
 * @param passFile
 * @param passContent
 * @returns {*}
 */
function exportPass(passFile, passContent) {
	var defer = Q.defer();

	var passFilename = path.resolve(__dirname, passFile);
	passFilename = passFilename.replace(/\W/, '');
	fs.ensureFileSync(passFilename);

	//Write icons
	var icons = [

	];

	assert(passFile, 'has passFile');
	assert(passContent, 'has conent');
	assert(passFilename, 'has filename');


	//Write pass.json
	fs.writeFileSync(passFilename, JSON.stringify(passContent), function(err) {
		if (err) {
			logger(err);
			defer.reject(err);
		} else {
			var msg = passFilename + ' was exported';


			defer.resolve(msg);
		}
	});
	return defer.promise;
}

/**
 * I handle reading the contents of a file.
 * @param localPath
 * @param mimeType
 * @param res
 */
function getFile(localPath, mimeType, res) {
	fs.readFile(localPath, function(err, contents) {
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
	// create a stream, and create the file if it doesn't exist
	var stream = fs.createWriteStream(localPath);
	logger('writeFile', localPath);
	stream.on("open", function() {
		// write to and close the stream at the same time
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
	logger('creating directory', path.normalize(localPath));

	fs.ensureDir(localPath, function(er) {
		if (er) {
			throw new Error(er, 'Problem creating directory:' + localPath);
		}
		callback(localPath);
	});
}

function checkDirectory(localPath, callback) {
	logger('checking directory', path.normalize(localPath));
	//fs.rmdir(localPath);
	fs.mkdir(localPath, function(er) {
		if (er) {
			throw new Error(er, 'Problem creating directory:' + localPath);
		}
		callback(localPath);
	});
}

/**
 * I handle creating the pass.raw folder and writing the pass.json file into it.
 * @param localPath
 * @param pass
 */
function createPass(localPath, pass, callback) {
	var defer = Q.defer();
	var passPath = localPath + path.sep + pass.description.replace(/\W/g, '_') +
		'.raw';
	console.log(passPath);
	assert(passPath, 'has path');

	fs.outputJson(passPath + '/pass.json', pass, function(d) {
		callback({
			directory: path.dirname(passPath),
			filename: passPath
		});
	});
}

module.exports = {
	name: 'jps-passbook',
	sign: signPass,
	signPass: signPass,
	export: exportPass,
	exportPass: exportPass,
	createDirectory: createDirectory,
	createPass: createPass
};
