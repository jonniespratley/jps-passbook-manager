var fs = require('fs'), path = require('path'), q = require('q');
var spawn = require('child_process').spawn;

var sign = function(pathToPass){
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

module.exports = {
  sign: sign,
  export: function(passFile, passContent){
  	var defer = q.defer();
  	fs.writeFile(passFile, JSON.stringify(passContent), function(err){
  		console.log(err);
  		if(err){
  			defer.reject(err);
  		} else {
            var msg = passFile + ' was exported';
            console.warn(msg);
            defer.resolve( msg );
        }

  	});
  	return defer.promise;
  }
};
