var fs = require('fs'), path = require('path'), q = require('q');
var spawn = require('child_process').spawn;

/**
 * I handle signing a pass with signpass bin.
 * @param pathToPass
 */
function signPass(pathToPass) {
    var signpass = spawn('bin/signpass', ['-p', pathToPass]);

    signpass.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    signpass.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    signpass.on('close', function (code) {
        console.log('signpass process exited with code ' + code);
    });

};

/**
 * I handle exporting a pass from object to a .json file.
 * @param passFile
 * @param passContent
 * @returns {*}
 */
function exportPass(passFile, passContent) {
    var defer = q.defer();

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
function createDirectory(localPath) {
    var defer = q.defer();

    console.log('creating directory', path.normalize(localPath));
    fs.mkdir(path.normalize(localPath), function (err) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(localPath);
        }
    });
    return defer.promise;
};


/**
 * I handle creating the pass.raw folder and writing the pass.json file into it.
 * @param localPath
 * @param pass
 */
function createPass(localPath, pass){
    var defer = q.defer();
    createDirectory(localPath + path.sep + pass.description.replace(/\W/g, '_') + '.raw').then(function(dir){
       console.log(dir, 'created');
        exportPass(dir + '/pass.json', pass).then(function(res){
            console.warn(res);
            defer.resolve(res);
        }, function(err){
            defer.reject(err);
        });

    }, function(err){
        defer.reject(err);
    });
    return defer.promise;

};



module.exports = {
    name: 'jps-passbook',
    sign: signPass,
    export: exportPass,
    createDirectory: createDirectory,
    createPass: createPass
};
