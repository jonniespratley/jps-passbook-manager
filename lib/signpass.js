'use strict';
const async = require('async');
const child_process = require('child_process');
const debug = require('debug');
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



 * @param pass_url {String} The url to the .pkpass
 * @param certificate_url {String} The url to the cert
 * @param certificate_password {String} The cert password
 * @param wwdr_intermediate_certificate_path  {String} The url to the wwrd cert
 * @param output_url  {String} The output url
 * @param compress_into_zip_file {Boolean} Compress into zip.
 * @constructor
 */
function SignPass(pass_url, cert_url, cert_password, key, wwdr_cert_path, output_url, compress, tmpdir) {
	var temporary_directory = tmpdir || os.tmpdir();

	temporary_directory += path.sep + _.last(pass_url.split('/'));
	const certificate_url = cert_url;
	const key_url = key;
	const certificate_password = cert_password;
	const wwdr_intermediate_certificate_path = wwdr_cert_path;
	const compress_into_zip_file = compress || true;
	const signature_url = path.resolve(temporary_directory, './signature');


	assert(pass_url, 'has pass url');
	assert(cert_url, 'has cert url');
	assert(cert_password, 'has cert password');
	assert(key, 'has pass key');
	assert(wwdr_cert_path, 'has WWDR Cert');

	var zip_url = '';
	var pkpass_url = '';
	var output_url = output_url;
	var p12_certificate;
	var wwdr_certificate;
	var manifest_url;
	var flag;
	var signed;

	var options = {
		temporary_directory: temporary_directory,
		pass_url: pass_url
	};

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
		if (has_signiture || has_manifiest) {
			throw new Error('Pass contains artifacts that must be removed!');
		}
		if (cb) {
			cb(null, null);
		}
	}

	function force_clean_raw_pass(cb) {
		let manifest_file = path.resolve(pass_url, './manifest.json');
		let signature_file = path.resolve(pass_url, './signature');
		if (fs.existsSync(signature_file)) {
			logger('force_clean_raw_pass', 'removing', signature_file);
			fs.removeSync(signature_file);
		}
		if (fs.existsSync(manifest_file)) {
			logger('force_clean_raw_pass', 'removing', manifest_file);
			fs.removeSync(manifest_file);
		}
		if (cb) {
			cb(null, {
				manifest: manifest_file,
				signature: signature_file
			});
		}
	}

	function create_temporary_directory(callback) {
		logger('create_temporary_directory', temporary_directory);
		try {
			fs.ensureDirSync(path.resolve(temporary_directory));
			callback(null, temporary_directory);
		} catch (err) {
			callback(err, null);
		}
	}

	function copy_pass_to_temporary_location(callback) {
		logger('copy_pass_to_temporary_location', pass_url);
		try {
			fs.copySync(pass_url, temporary_directory);
			callback(null, pass_url);
		} catch (err) {
			callback(err, null);
		}
	}

	function clean_ds_store_files(callback) {
		logger('clean_ds_store_files');
		let ds_files = path.resolve(temporary_directory, './.DS_Store');
		try {
			fs.removeSync(ds_files);
			callback(null, ds_files);
		} catch (err) {
			callback(err, null);
		}
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
				fs.writeFileSync(_manifestFilename, JSON.stringify(_manifest));
				logger('generate_json_manifest', 'wrote to', _manifestFilename);
				callback(null, _manifestFilename);
			}
		});
	}


	function sign_manifest(cb) {
		let signedContents;
		logger('sign_manifest');

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
				-passin pass:${certificate_password}
			`;

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
		sign_pass: sign_pass
	}
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
