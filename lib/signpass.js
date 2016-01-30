'use strict';
const async = require('async');
const child_process = require('child_process');
const assert = require('assert');
const glob = require('glob');
const _ = require('lodash');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const utils = require('./utils');
const zip = new require('node-zip')();



/**
 * SignPass class

 var certFilename = path.resolve(__dirname, '../../certificates/pass-cert.pem');
 var key = path.resolve(__dirname, '../../certificates/pass-key.pem');
 var wwdrFilename = path.resolve(__dirname, '../../certificates/wwdr-authority.pem');
 var certPass = 'fred';
 var passFilename = path.resolve(__dirname, '../../data/pass-jonniespratley.json');
 var rawpassFilename = path.resolve(__dirname, '../../data/passes/pass-jonniespratley.raw');
 var pkpassFilename = path.resolve(__dirname, '../../data/passes/pass-jonniespratley.pkpass');
 var outputFilename = path.resolve(__dirname, '../temp/passes/');
 var files = null;


 var options = {
 	passFilename: rawpassFilename,
 	cert: certFilename,
 	passphrase: certPass,
 	key: keyFilename,
 	wwdr: wwdrFilename,
 	outputFilename: tmpdir,
 	compress: true
 };

 signpass = new SignPass(options);
 signpass.sign(function(err, resp) {
	 _done(resp);
 });

 * @param pass_url {String} The url to the .pkpass
 * @param certificate_url {String} The url to the cert
 * @param certificate_password {String} The cert password
 * @param wwdr_certificate  {String} The url to the wwrd cert
 * @param output_url  {String} The output url
 * @param compress_into_zip_file {Boolean} Compress into zip.
 * @constructor
 */
function SignPass(opts /*pass_url, cert_url, cert_password, key, wwdr_cert_path, output_url, compress, tmpdir*/ ) {

	var defaults = {
		passFilename: 'pass.raw',
		cert: 'pass.cert',
		passphrase: 'fred',
		key: null,
		wwdr: null,
		outputFilename: null,
		compress: true,
		force: true,
		tempDir: os.tmpdir()
	};

	var options = _.extend(defaults, opts);
	let logger = utils.getLogger('signpass:' + path.basename(options.passFilename));
	logger('SignPass', options);

	let temporary_directory = options.tempDir;

	assert(options.passFilename, 'has passFilename');
	temporary_directory += path.sep + _.last(options.passFilename.split('/'));

	const certificate_url = options.cert;
	const certificate_password = options.passphrase;
	const key_url = options.key;
	const compress_into_zip_file = options.compress;

	if (!options.outputFilename) {
		options.outputFilename = path.resolve(path.dirname(options.passFilename));
	}

	var signature_url = path.resolve(temporary_directory, './signature');
	var cert_url = options.cert;
	var cert_password = options.passphrase;
	var key = options.key;
	var pass_url = options.passFilename;
	var output_url = options.outputFilename;
	var zip_url = '';
	var pkpass_url = '';

	var p12_certificate;
	const wwdr_certificate = options.wwdr || path.resolve(__dirname, '../certificates/wwdr-authority.pem');
	var manifest_url;
	var flag;
	var signed;

	assert(options, 'has options');
	assert(pass_url, 'has pass url');
	assert(cert_url, 'has cert url');
	assert(cert_password, 'has cert password');
	assert(wwdr_certificate, 'has wwdr');

	//	assert(fs.existsSync(cert_url), 'has cert');
	//assert(fs.existsSync(pass_url), 'has pass.raw');
	//	assert(fs.existsSync(wwdr_certificate), 'has WWDR Cert');

	logger('SignPass', 'instance');
	logger('temporary_directory', temporary_directory);
	logger('certificate_url', certificate_url);
	logger('certificate_password', certificate_password);
	logger('wwdr_certificate', wwdr_certificate);
	logger('output_url', output_url);
	logger('compress_into_zip_file', compress_into_zip_file);

	function validate_directory_as_unsigned_raw_pass(cb) {
		let has_manifiest = fs.existsSync(path.resolve(pass_url, './manifest.json'));
		let has_signiture = fs.existsSync(path.resolve(pass_url, './signature'));
		if (options.force) {
			force_clean_raw_pass(cb);
		} else if (has_signiture || has_manifiest) {
			throw new Error('Pass contains artifacts that must be removed!');
		} else {
			if (cb) {
				cb(null, null);
			}
		}
	}

	function force_clean_raw_pass(callback) {
		let manifest_file = path.resolve(pass_url, './manifest.json');
		let signature_file = path.resolve(pass_url, './signature');
		let files = [manifest_file, signature_file];
		let _done = _.after(files.length, function() {
			callback(null, {
				manifest: manifest_file,
				signature: signature_file
			});
		});

		_.forEach(files, function(file) {
			logger('force_clean_raw_pass', 'removing', path.basename(file));
			fs.remove(file, function(err) {
				_done(err);
			});
		});
	}

	function create_temporary_directory(callback) {
		logger('create_temporary_directory', temporary_directory);
		fs.ensureDir(path.resolve(temporary_directory), function(err) {
			callback(err, temporary_directory);
		});
	}

	function copy_pass_to_temporary_location(callback) {
		logger('copy_pass_to_temporary_location', pass_url, temporary_directory);
		//	fs.ensureDirSync(pass_url);
		fs.copy(path.resolve(pass_url, './'), temporary_directory, function(err) {
			callback(err, pass_url);
		});
	}

	function clean_ds_store_files(callback) {
		logger('clean_ds_store_files');
		let ds_files = path.resolve(temporary_directory, './.DS_Store');
		fs.remove(ds_files, function(err) {
			callback(err, ds_files);
		});
	}

	function generate_json_manifest(callback) {
		logger('generate_json_manifest');
		let _manifest = {};
		let _manifestFilename = path.resolve(temporary_directory, './manifest.json');

		manifest_url = _manifestFilename;
		glob(temporary_directory + path.sep + '**/*.*', function(err, files) {
			if (err) {
				callback(err, null)
			}
			if (files && files.length) {
				files.forEach(function(file) {
					//	logger('checksum', file);
					_manifest[file.replace(temporary_directory + path.sep, '')] = utils.checksum(fs.readFileSync(file), 'sha1');
				});
				fs.writeFile(_manifestFilename, JSON.stringify(_manifest), function(err) {
					logger('generate_json_manifest', 'wrote to', _manifestFilename);
					callback(err, _manifestFilename);
				});
			}
		});
	}

	function sign_manifest(cb) {
		let signedContents;
		logger('sign_manifest');
		signature_url = path.resolve(temporary_directory, './signature');

		let sign_pass_cmd =
			`openssl smime \
			-binary \
			-sign \
			-certfile ${wwdr_certificate} \
			-signer ${certificate_url} \
			-inkey ${key_url} \
			-in ${manifest_url} \
			-out ${signature_url} \
			-outform DER \
			-passin pass:${certificate_password}`;

		logger('cmd', sign_pass_cmd);

		let exec = child_process.exec(sign_pass_cmd, {
			cwd: pass_url
		}, function(error, stdout, stderr) {
			if (error) {
				cb(error, null);
			} else {
				logger('sign_manifest', 'child_process', stdout, stderr);
				cb(null, signature_url);
			}
		});
	}

	function compress_pass_file(callback) {
		logger('compress_pass_file');
		let filename = temporary_directory.replace('.raw', '.zip');
		let zip_pass_cmd = `zip -R * ${filename}`;

		pkpass_url = filename.replace('.zip', '.pkpass');
		glob(path.resolve(temporary_directory, './*'), function(err, files) {
			if (err) {
				callback(err, null);
			}
			var done = _.after(files.length, function() {
				var data = zip.generate({
					base64: false,
					compression: 'DEFLATE'
				});
				zip_url = filename;
				fs.writeFileSync(filename, data, 'binary');
				logger('compress_pass_file', 'writeZip', path.basename(filename));
				callback(null, filename);
			});

			_.forEach(files, function(file) {
				logger('compress_pass_file', 'add', path.basename(file));
				zip.file(path.basename(file), fs.readFileSync(path.resolve(file)));
				done();
			});
		});
	};

	function rename_pass_file(cb) {
		pkpass_url = zip_url.replace('.zip', '.pkpass');
		logger('rename_pass_file', 'to', pkpass_url);
		fs.copy(zip_url, pkpass_url, function(err) {
			cb(err, pkpass_url);
		});
	}

	function copy_to_dest(cb) {
		output_url = path.resolve(options.outputFilename, './' + path.basename(pkpass_url));
		fs.remove(output_url, function(err) {
			logger('copy_to_dest', output_url);
			fs.copy(pkpass_url, output_url, function(err) {
				cb(err, options.outputFilename);
			});
		});

	}

	function delete_temp_dir(cb) {
		logger('delete_temp_dir');
		try {
			fs.removeSync(pkpass_url);
			fs.removeSync(zip_url);
			fs.removeSync(temporary_directory);
			cb(null, null);
		} catch (err) {
			cb(err, null);
		}
	}

	function sign_pass(cb) {
		logger('sign_pass');
		async.series({
			validate: validate_directory_as_unsigned_raw_pass,
			raw: force_clean_raw_pass,
			tmpdir: create_temporary_directory,
			copy: copy_pass_to_temporary_location,
			clean: clean_ds_store_files,
			manifest: generate_json_manifest,
			signature: sign_manifest,
			zip: compress_pass_file,
			pkpass: rename_pass_file,
			dest: copy_to_dest,
			cleantmpdir: delete_temp_dir
		}, function(err, result) {
			logger(err, result);

			if (err) {
				throw err;
			}

			if (cb) {
				cb(err, result);
			}
		});

	}
	return {
		sign: sign_pass,
		signPromise: function(raw) {
			return new Promise(function(resolve, reject) {
				sign_pass(function(err, resp) {
					if (err) {
						reject(err);
					}
					resolve(resp);
				});
			});
		}
	};
}



/*
$ openssl pkcs12 -in cert.p12 -clcerts -nokeys -out certificate.pem
$ openssl pkcs12 -in cert.p12 -nocerts -out key.pem

$ openssl smime -sign \
							-detach \
							-in manifest.json \
							-out ./signature \
							-outform DER \
							-inkey ./certificates/pass-passbookmanager-key.p12 \
							-signer ./certificates/AppleWWDRCA.cer
*/

SignPass.passTypes = [{
	value: 'generic',
	name: 'Generic'
}, {
	value: 'github',
	name: 'Github'
}, {
	value: 'boardingPass',
	name: 'Boarding Pass'
}, {
	value: 'coupon',
	name: 'Coupon'
}, {
	value: 'eventTicket',
	name: 'Event Ticket'
}, {
	value: 'storeCard',
	name: 'Store Card'
}];


function PassTypeId(id, o) {
	let _id = id.replace(/\W/g, '-');
	return _.assign({
		_id: _id,
		passTypeIdentifier: o.passTypeIdentifier,
		cert: '',
		key: '',
		passphrase: '',
		docType: 'pass-type-id'
	}, o);
}

SignPass.createPassTypeId = function(id, o) {
	return new PassTypeId(id, o);
};

/*
 take a apple .p12 pass cert and make the pems.
 $ openssl pkcs12 -in cert.p12 -clcerts -nokeys -out certificate.pem
 $ openssl pkcs12 -in cert.p12 -nocerts -out key.pem

 @param {String} p12 - The path to the .p12 cert.
 @param {String} pass - The passpharse for the .p12 cert.
*/
SignPass.createPems = function(passTypeIdentifier, p12, pass, outputPath, callback) {
	let _out = [],
		cmd1 = {},
		cmd2 = {},
		_p12,
		_outCert,
		_cmd1,
		_cmd2,
		_outKey,
		_path = path.parse(p12);

	assert(passTypeIdentifier, 'has passTypeIdentifier');

	let passTypeIdentifierFilename = passTypeIdentifier.replace(/\W/g, '-');

	let certOutputPath = path.resolve(outputPath, './');

	function _checkCert(cb) {
		fs.exists(p12, function(err) {
			cb(err, p12);
		});
	}

	function _copyP12(cb) {
		_p12 = path.resolve(certOutputPath, passTypeIdentifierFilename + '-' + path.basename(p12));
		fs.removeSync(_p12);
		fs.copy(path.resolve(p12), _p12, function(err) {
			p12 = _p12;
			cb(err, _p12);
		});
	}

	function _certCmd(cb) {
		_path.ext = '.pem';
		_path.name += '-cert';
		_outCert = p12.replace('.p12', '-cert.pem');
		_cmd1 = `openssl pkcs12 -in ${p12} -passin pass:${pass} -clcerts -nokeys -out ${_outCert}`;
		fs.removeSync(_outCert);

		cmd1 = {
			filename: _outCert,
			cmd: _cmd1
		};
		cb(null, _outCert);
	}

	function _keyCmd(cb) {
		_path.name += '-key';
		_outKey = p12.replace('.p12', '-key.pem');
		_cmd2 = `openssl pkcs12 -in ${p12} -nocerts -passout pass:${pass} -passin pass:${pass} -out ${_outKey}`;
		fs.removeSync(_outKey);

		cmd2 = {
			filename: _outKey,
			cmd: _cmd2
		};
		cb(null, _outKey);
	}

	function _certCmdExec(cb) {
		child_process.exec(cmd1.cmd, function(err, stdout, stderr) {
			cb(err, cmd1.cmd);
		});
	}

	function _keyCmdExec(cb) {
		child_process.exec(cmd2.cmd, function(err, stdout, stderr) {
			cb(err, cmd2.cmd);
		});
	}

	async.series({

		p12: _copyP12,
		cert: _certCmd,
		key: _keyCmd,
		certcmd: _certCmdExec,
		keycmd: _keyCmdExec
	}, function(err, result) {

		let _out = SignPass.createPassTypeId(passTypeIdentifier, result);
		_out.passTypeIdentifier = passTypeIdentifier;
		_out.p12 = p12;
		_out.passphrase = pass;
		if (callback) {
			callback(err, _out);
		}
	});
};



module.exports = SignPass;
