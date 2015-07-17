var fs = require('fs-extra'),
	path = require('path'),
	fsutils = require('fs-utils'),
	Q = require('q'),
	spawn = require('child_process').spawn;
var fsextra = require('fs-extra');
/**
 * I handle signing a pass with signpass bin.
 * @param pathToPass
 */
function signPass(pathToPass, callback) {
	var signpass = spawn('./bin/signpass', ['-p', pathToPass]);
	console.warn('bin/signpass -p ' + pathToPass);
	signpass.stdout.on('data', function(data) {
		console.log('stdout: ' + data);
	});

	signpass.on('error', function(err) {
		console.log('signpass process exited with code ' + code);
		throw err;
	});

	signpass.on('close', function(code) {
		if (code !== 0) {
			console.log('signpass process exited with code ' + code);
		}
		callback(pathToPass.replace('.raw', '.pkpass'));
	});
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
	fs.ensureFileSync(passFilename);
	fs.writeFile(passFilename, JSON.stringify(passContent), function(err) {
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
};

/**
 * I handle creating a directory.
 * @param localPath
 * @returns {*}
 */
function createDirectory(localPath, callback) {
	console.log('creating directory', path.normalize(localPath));

	fsextra.ensureDir(localPath, function(er) {
		if (er) {
			throw new Error(er, 'Problem creating directory:' + localPath);
		}
		callback(localPath);
	});
};

function checkDirectory(localPath, callback) {
	console.log('checking directory', path.normalize(localPath));
	fsutils.rmdir(localPath);
	fs.mkdir(localPath, function(er) {
		if (er) {
			throw new Error(er, 'Problem creating directory:' + localPath);
		}
		callback(localPath);
	});
};

/**
 * I handle creating the pass.raw folder and writing the pass.json file into it.
 * @param localPath
 * @param pass
 */
function createPass(localPath, pass, callback) {
	var defer = Q.defer();
	var passPath = localPath + path.sep + pass.description.replace(/\W/g, '_') +
		'.raw';
	fsextra.outputJson(passPath + '/pass.json', pass, function(d) {
		callback({
			directory: path.dirname(passPath),
			filename: passPath
		});
	});
};

module.exports = {
	name: 'jps-passbook',
	sign: signPass,
	signPass: signPass,
	export: exportPass,
	exportPass: exportPass,
	createDirectory: createDirectory,
	createPass: createPass
};
