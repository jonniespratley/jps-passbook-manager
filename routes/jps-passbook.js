var fs = require('fs'), path = require('path'), fsutils = require('fs-utils'), Q = require('q'), spawn = require('child_process').spawn, fsextra = require('fs-extra');
'use strict';

/**
 * I handle signing a pass with signpass bin.
 * @param pathToPass
 */
function signPass(pathToPass, callback) {
	var cmd = 'bin/signpass -p ' + pathToPass;
	//console.warn(cmd);


	var exec = require('child_process').exec,

		signpass = exec('bin/signpass -p ' + pathToPass,
		function (error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			callback(pathToPass.replace('.raw', '.pkpass'));
		});

	/*
	var signpass = spawn('./bin/signpass', ['-p', pathToPass]);
	console.warn(cmd);
	signpass.stdout.on('data', function (data) {
		console.log('stdout: ' + data);
	});

	signpass.on('error', function (err) {
		console.log('signpass process exited with code ' + code);
		throw err;
	});

	signpass.on('close', function (code) {
		if (code !== 0) {
			console.log('signpass process exited with code ' + code);
		}
		callback(pathToPass.replace('.raw', '.pkpass'));
	});
	*/
};

/**
 * I handle exporting a pass from object to a .json file.
 * @param passFile
 * @param passContent
 * @returns {*}
 */
function exportPass(passFile, passContent) {
	var defer = Q.defer();

	var passFilename = path.resolve(passFile);
	passFilename = passFilename.replace(' ', '');

	fs.writeFile(passFilename, JSON.stringify(passContent), function (err) {
		console.log(err);
		if (err) {
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
};

/**
 * I handle writing contents to a file
 * @param localPath
 * @param contents
 * @param callback
 */
function writeFile(localPath, contents, callback) {
	// create a stream, and create the file if it doesn't exist
	stream = fs.createWriteStream(localPath);
	console.log('writeFile', localPath);
	stream.on("open", function () {
		// write to and close the stream at the same time
		stream.end(contents, 'utf-8');
		callback({
			directory: path.dirname(localPath),
			filename: path.basename(localPath),
			name: localPath,
			contents: contents
		});
	});
};

/**
 * I handle creating a directory.
 * @param localPath
 * @returns {*}
 */
function createDirectory(localPath, callback) {
	console.log('creating directory', path.normalize(localPath));

	fsextra.ensureDir(localPath, function (er) {
		if (er) {
			throw new Error(er, 'Problem creating directory:' + localPath);
		}
		callback(localPath);
	});
};

/**
 * I handle checking a a directory by removing it if it exists.
 * @param localPath
 * @param callback
 */
function checkDirectory(localPath, callback) {
	console.log('checking directory', path.normalize(localPath));

	fsutils.rmdir(localPath);
	fs.mkdir(localPath, function (er) {
		if (er) {
			throw new Error(er, 'Problem creating directory:' + localPath);
		}
		callback(localPath);
	});
};

function copyPassArtifacts(passType, dest){
	var defer = Q.defer();

	console.warn('Copying artifacts from', 'www/passes/'+passType, 'to', dest);

	defer.resolve('Done');

	return defer.promise;
};

/**
 * I handle creating the pass.raw folder and writing the pass.json file into it.
 * @param localPath
 * @param pass
 */
function createPass(options) {
	var passFilename, defer = Q.defer();
	if(options.filename){
		passFilename = options.filename;
	} else {
		passFilename = options.pass.organizationName + ' ' + options.pass.description;
	}
	passFilename = passFilename.replace(/\W/g, '-');

	//pass folder path
	var passPath = options.path + path.sep + passFilename + '.raw';

	//artifact folder path
	var artifactPath = path.resolve(__dirname, '..' + path.sep + 'www' + path.sep + 'passes' + path.sep + options.pass.type);

	//Create directory
	fsextra.ensureDir(passPath, function(err){
		if(err){
			defer.reject({error: err});
		}

		//Copy artifacts
		fsextra.copy(artifactPath, passPath, function(err) {
			if(err){
				defer.reject({error: err});
			} else {
				//Create .json
				fsextra.outputJson(passPath + '/pass.json', options.pass, function (d) {
					defer.resolve({
						directory: path.dirname(passPath),
						path: passPath,
						filename: path.basename(passPath)
					});
				});
			}
		});

	});

	return defer.promise;
};

/**
 * I am the jpsPassbook object
 * @type {{name: string, sign: signPass, signPass: signPass, export: exportPass, exportPass: exportPass, createDirectory: createDirectory, createPass: createPass}}
 */
var jpsPassbook = {
	name: 'jps-passbook',
	sign: signPass,
	signPass: signPass,
	export: exportPass,
	exportPass: exportPass,
	createDirectory: createDirectory,
	createPass: createPass
};
module.exports = jpsPassbook;
