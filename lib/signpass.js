'use strict';
const async = require('async');
const debug = require('debug');
const pem = require('pem');
const glob = require('glob');
const _ = require('lodash');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const utils = require('./utils');


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
function SignPass(pass_url, certificate_url, certificate_password, wwdr_intermediate_certificate_path, output_url,
	compress_into_zip_file) {

	var temporary_directory = os.tmpdir();
	var pass_url = pass_url;
	var certificate_url = certificate_url;
	var certificate_password = certificate_password;
	var wwdr_intermediate_certificate_path = wwdr_intermediate_certificate_path;
	var output_url = output_url;
	var compress_into_zip_file = compress_into_zip_file;

	var p12_certificate;
	var wwdr_certificate;
	var manifest_url;
	var flag;
	var signed;
	var signature_url = path.resolve(temporary_directory, './signature');
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


	var validate_directory_as_unsigned_raw_pass = function(cb) {
		let has_manifiest = fs.existsSync(path.resolve(pass_url, './manifest.json'));
		let has_signiture = fs.existsSync(path.resolve(pass_url, './signature'));
		if (has_signiture || has_manifiest) {
			throw new Error('Pass contains artifacts that must be removed!');
		}
		if (cb) {
			cb(null, null);
		}

	};

	var force_clean_raw_pass = function(cb) {
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
			cb(null, this);
		}
	};

	var create_temporary_directory = function(callback) {
		temporary_directory += path.sep + _.last(pass_url.split('/'));
		logger('create_temporary_directory', temporary_directory);

		try {
			fs.ensureDirSync(path.resolve(temporary_directory));
			callback(null, temporary_directory);
		} catch (err) {
			callback(err, null);
		}
	};

	var copy_pass_to_temporary_location = function(callback) {
		logger('copy_pass_to_temporary_location', pass_url);
		try {
			fs.copySync(pass_url, temporary_directory);
			callback(null, temporary_directory);
		} catch (err) {
			callback(err, null);
		}
	};

	var clean_ds_store_files = function(callback) {
		logger('clean_ds_store_files');
		try {
			glob(temporary_directory + '**/.DS_Store', options, function(er, files) {
				if (files && files.length) {
					files.forEach(function(file) {
						fs.removeSync(file);
					});
					callback(null, temporary_directory);
				}
			});
		} catch (err) {
			callback(err, null);
		}
	};

	var generate_json_manifest = function(callback) {
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
				fs.writeFileSync(_manifestFilename, _manifest);
				logger('generate_json_manifest', 'wrote to', _manifestFilename);
				callback(null, _manifest);
			}
		});
	};

	const forge = require('node-forge');
	/**
	 * Sign manifest using p12 cert and key for passes
	 * @param cb
	 */
	var sign_manifest = function(cb) {
		logger('sign_manifest');

		p12_certificate = fs.readFileSync(path.resolve(certificate_url));
		wwdr_certificate = fs.readFileSync(path.resolve(wwdr_intermediate_certificate_path));
		let manifest = fs.readFileSync(path.resolve(manifest_url));

		var pki = forge.pki;

		// convert a PEM-formatted public key to a Forge public key
		var publicKey = pki.publicKeyFromPem(wwdr_certificate);

		logger('publicKey', publicKey);


		let flagged;
		let signed;

		pem.readPkcs12(p12_certificate, {
			p12Password: certificate_password
		}, function(err, resp) {
			logger('sign_manifest', 'readPkcs12', err, resp);

			cb(null, resp);
		});
		/*
		 # Import the certificates
		 p12_certificate = OpenSSL::PKCS12::new(File.read(self.certificate_url), self.certificate_password)
		 wwdr_certificate = OpenSSL::X509::Certificate.new(File.read(self.wwdr_intermediate_certificate_path))

		 # Sign the data
		 flag = OpenSSL::PKCS7::BINARY|OpenSSL::PKCS7::DETACHED
		 signed = OpenSSL::PKCS7::sign(p12_certificate.certificate, p12_certificate.key, File.read(self.manifest_url), [wwdr_certificate], flag)

		 # Create an output path for the signed data
		 self.signature_url = self.temporary_path + "/signature"

		 # Write out the data
		 File.open(self.signature_url, "w") do |f|
		 f.syswrite signed.to_der
		 end

		 pem.readPkcs12(p12_certificate, {
		 p12Password: certificate_password
		 }, function (err, resp) {
		 logger('sign_manifest', 'resp', err, resp);

		 cb(resp);
		 });*/

		//	cb(null, p12_certificate);

	};

	const AdmZip = require('adm-zip');
	/**
	 * Compress .raw into .zip and rename into .pkpass
	 */
	var compress_pass_file = function(callback) {
		logger('compress_pass_file');
		let filename;
		glob(temporary_directory + path.sep + '**/*.*', function(err, files) {
			if (err) {
				callback(err, null);
			}
			var zip = new AdmZip();
			if (files && files.length) {
				files.forEach(function(file) {
					logger('compress_pass_file', 'add', file);
					zip.addLocalFile(path.resolve(file), path.basename(file));
					//zip.addFile(path.basename(file), fs.readFileSync(file), 'file');
				});
			}
			filename = temporary_directory.replace('.raw', '.zip');
			zip.writeZip(filename);
			logger('compress_pass_file', 'writeZip', filename);

			callback(null, filename);
			//utils.createZip(files, temporary_directory, cb);
		});
	};

	var delete_temp_dir = function(cb) {
		cb(null, '');
	};


	this.sign_pass = function(cb) {
		logger('sign_pass');

		async.series([
			validate_directory_as_unsigned_raw_pass,
			force_clean_raw_pass,
			create_temporary_directory,
			copy_pass_to_temporary_location,
			clean_ds_store_files,
			generate_json_manifest,
			sign_manifest,
			compress_pass_file,
			delete_temp_dir
		], function(err, result) {
			logger(err, result);
			if (cb) {
				cb(err, result);
			}

		});

		//this.delete_temp_dir();
	};


}
module.exports = SignPass;
