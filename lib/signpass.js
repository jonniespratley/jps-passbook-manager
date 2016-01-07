'use strict';
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const utils = require('./utils');

module.exports = function() {
  let logger = utils.getLogger('signpass');

  function SignPass(
    pass_url,
    certificate_url,
    certificate_password,
    wwdr_intermediate_certificate_path,
    output_url,
    compress_into_zip_file) {

    this.temporary_directory = os.tmpdir();
    this.pass_url = pass_url;
    this.certificate_url = certificate_url;
    this.certificate_password = certificate_password;
    this.wwdr_intermediate_certificate_path = wwdr_intermediate_certificate_path;
    this.output_url = output_url;
    this.compress_into_zip_file = compress_into_zip_file;


    this.sign_pass = function() {
      logger('sign_pass');
      this.validate_directory_as_unsigned_raw_pass();
      this.force_clean_raw_pass();
      this.create_temporary_directory();
      this.copy_pass_to_temporary_location();
      this.clean_ds_store_files();
      this.generate_json_manifest();
      this.sign_manifest();
      this.compress_pass_file();
      //this.delete_temp_dir();
    };

    this.validate_directory_as_unsigned_raw_pass = function() {
      let has_manifiest = fs.existsSync(path.resolve(this.pass_url, './manifest.json'));
      let has_signiture = fs.existsSync(path.resolve(this.pass_url, './signature'));
      if (has_signiture || has_manifiest) {
        throw new Error('Pass contains artifacts that must be removed!');
      }
    };

    this.force_clean_raw_pass = function() {
      let manifest_file = path.resolve(this.pass_url, './manifest.json');
      let signature_file = path.resolve(this.pass_url, './signature');
      if (fs.existsSync(signature_file)) {
        fs.removeSync(signature_file);
      }
      if (fs.existsSync(manifest_file)) {
        fs.removeSync(manifest_file);
      }
    };

    this.create_temporary_directory = function() {
      logger('create_temporary_directory');
      fs.ensureDirSync(this.temporary_directory)
    };

    this.copy_pass_to_temporary_location = function() {
      logger('copy_pass_to_temporary_location');
    };

    this.clean_ds_store_files = function() {
      logger('clean_ds_store_files');
    };
    this.generate_json_manifest = function() {
      logger('generate_json_manifest');
    };
    this.sign_manifest = function() {
      logger('sign_manifest');
    };
    this.compress_pass_file = function() {
      logger('compress_pass_file')
    };
    this.delete_temp_dir = function() {

    };

  }

  return SignPass;

};
