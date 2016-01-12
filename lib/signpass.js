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
const AdmZip = require('adm-zip');
const forge = require('node-forge');

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
function SignPass(pass_url, cert_url, cert_password, wwdr_cert_path, output_url, compress) {
	var temporary_directory = os.tmpdir();
	const certificate_url = cert_url;
	const certificate_password = cert_password;
	const wwdr_intermediate_certificate_path = wwdr_cert_path;
	const compress_into_zip_file = compress || true;
	const signature_url = path.resolve(temporary_directory, './signature');

	var pass_url = pass_url;
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
			cb(null, this);
		}
	}

	function create_temporary_directory(callback) {
		temporary_directory += path.sep + _.last(pass_url.split('/'));
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
				fs.writeFileSync(_manifestFilename, _manifest);
				logger('generate_json_manifest', 'wrote to', _manifestFilename);
				callback(null, _manifestFilename);
			}
		});
	}


	/**
	 * Sign manifest using p12 cert and key for passes
	 * @param cb
	 */
	function sign_manifest(cb) {
		let signedContents;
		logger('sign_manifest');

		// # Import the certificates
		p12_certificate = fs.readFileSync(path.resolve(certificate_url));
		wwdr_certificate = fs.readFileSync(path.resolve(wwdr_intermediate_certificate_path));

		let manifest = fs.readFileSync(path.resolve(manifest_url));

		var p7 = forge.pkcs7.createSignedData();


		logger('manifest', manifest);

		pem.readPkcs12(p12_certificate, {
			p12Password: certificate_password
		}, function(err, resp) {
			logger('sign_manifest', 'readPkcs12');

			signedContents = [
				resp.cert,
				resp.key,
				manifest,
				wwdr_certificate
			].join('');

			fs.writeFileSync(signature_url, signedContents);

			p7.content = forge.util.createBuffer(manifest, 'utf8');
			p7.addCertificate(wwdr_certificate);
			p7.addSigner({
				key: resp.key,
				certificate: resp.cert,
				//	digestAlgorithm: forge.pki.oids.sha256,
				authenticatedAttributes: [{
					type: forge.pki.oids.contentType,
					value: forge.pki.oids.data
				}, {
					type: forge.pki.oids.messageDigest
				}, {
					type: forge.pki.oids.signingTime,
					value: new Date()
				}]
			});
			p7.sign();

			//	var pem = forge.pkcs7.messageToPem(p7);
			//	logger('pem', pem);

			logger('sign_manifest', signedContents);
			cb(null, signature_url);
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
	}


	/**
	 * Compress .raw into .zip and rename into .pkpass
	 */
	function compress_pass_file(callback) {
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
					//	zip.addLocalFile(path.resolve(file), path.basename(file));
					zip.addFile(path.basename(file), fs.readFileSync(file), 'file');
				});
			}
			filename = temporary_directory.replace('.raw', '.zip');
			zip.writeZip(filename);

			pkpass_url = filename.replace('.zip', '.pkpass');
			fs.copySync(filename, pkpass_url);
			logger('compress_pass_file', 'writeZip', filename);

			callback(null, filename);
			//utils.createZip(files, temporary_directory, cb);
		});
	};

	function delete_temp_dir(cb) {

		cb(null, '');
	};


	function sign_pass(cb) {
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
	}

	return {
		sign_pass: sign_pass
	}
}
module.exports = SignPass;
