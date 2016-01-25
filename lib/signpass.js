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

let logger = utils.getLogger('signpass');

/**
 * SignPass class

 var certFilename = path.resolve(__dirname, '../../certificates/pass-cert.pem');
 var keyFilename = path.resolve(__dirname, '../../certificates/pass-key.pem');
 var wwdrFilename = path.resolve(__dirname, '../../certificates/wwdr-authority.pem');
 var certPass = 'fred';
 var passFilename = path.resolve(__dirname, '../../data/pass-jonniespratley.json');
 var rawpassFilename = path.resolve(__dirname, '../../data/passes/pass-jonniespratley.raw');
 var pkpassFilename = path.resolve(__dirname, '../../data/passes/pass-jonniespratley.pkpass');
 var outputFilename = path.resolve(__dirname, '../temp/passes/');
 var files = null;

 var options = {
 	passFilename: rawpassFilename,
 	certFilename: certFilename,
 	certPassword: certPass,
 	keyFilename: keyFilename,
 	wwdrFilename: wwdrFilename,
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
 * @param wwdr_intermediate_certificate_path  {String} The url to the wwrd cert
 * @param output_url  {String} The output url
 * @param compress_into_zip_file {Boolean} Compress into zip.
 * @constructor
 */
function SignPass(opts /*pass_url, cert_url, cert_password, key, wwdr_cert_path, output_url, compress, tmpdir*/ ) {

	var defaults = {
		passFilename: '',
		certFilename: '',
		certPassword: null,
		keyFilename: null,
		wwdrFilename: null,
		outputFilename: null,
		compress: true,
		force: true,
		tempDir: os.tmpdir()
	};

	var options = _.extend(defaults, opts);

	var temporary_directory = options.tempDir;
	temporary_directory += path.sep + _.last(options.passFilename.split('/'));

	logger('SignPass', options);


	const certificate_url = options.certFilename;
	const certificate_password = options.certPassword;
	const key_url = options.keyFilename;
	const wwdr_intermediate_certificate_path = options.wwdrFilename;
	const compress_into_zip_file = options.compress;

	var signature_url = path.resolve(temporary_directory, './signature');
	var cert_url = options.certFilename;
	var cert_password = options.certPassword;
	var key = options.keyFilename;
	var pass_url = options.passFilename;
	var output_url = options.outputFilename;
	var zip_url = '';
	var pkpass_url = '';

	var p12_certificate;
	var wwdr_certificate;
	var manifest_url;
	var flag;
	var signed;

	assert(options, 'has options');
	assert(pass_url, 'has pass url');
	assert(cert_url, 'has cert url');
	assert(cert_password, 'has cert password');

	assert(fs.existsSync(cert_url), 'has cert');
	assert(fs.existsSync(pass_url), 'has pass.raw');
	assert(fs.existsSync(wwdr_intermediate_certificate_path), 'has WWDR Cert');

	logger('SignPass', 'instance');
	logger('temporary_directory', temporary_directory);
	logger('certificate_url', certificate_url);
	logger('certificate_password', certificate_password);
	logger('wwdr_intermediate_certificate_path', wwdr_intermediate_certificate_path);
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
			logger('force_clean_raw_pass', 'removing', file);
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
		logger('copy_pass_to_temporary_location', pass_url);
		fs.copy(pass_url, temporary_directory, function(err) {
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
					logger('checksum', file);
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
			-certfile ${wwdr_intermediate_certificate_path} \
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


	/**
	 * Compress .raw into .zip and rename into .pkpass
	 */
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
				console.log('done saving!');
				var data = zip.generate({
					base64: false,
					compression: 'DEFLATE'
				});
				zip_url = filename;
				fs.writeFileSync(filename, data, 'binary');
				logger('compress_pass_file', 'writeZip', filename);
				callback(null, filename);
			});

			_.forEach(files, function(file) {
				logger('compress_pass_file', 'add', file);
				zip.file(path.basename(file), fs.readFileSync(path.resolve(file)));
				done();
			});
		});
	};


	function rename_pass_file(callback) {
		pkpass_url = zip_url.replace('.zip', '.pkpass');
		fs.copySync(zip_url, pkpass_url);
		callback(null, pkpass_url);
	}

	function delete_temp_dir(cb) {
		cb(null, '');
	};


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
			tmp: delete_temp_dir
		}, function(err, result) {
			logger(err, result);
			if (cb) {
				cb(err, result);
			}
		});
		//this.delete_temp_dir();
	}

	return {
		sign: sign_pass
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
SignPass.createPems = function(p12Path) {

};

module.exports = SignPass;
