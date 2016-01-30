'use strict';
module.exports = function(program) {
  const path = require('path');
  const fs = require('fs-extra');
  const jpsPassbook = program.require('jps-passbook')(program);
  const SignPass = program.require('signpass');

  let logger = program.getLogger('AdminController');
  let Controller = {};


  // TODO: Save pass Type id to database, and create pems.
  function savePassTypeIdentifier(obj) {
    return new Promise(function(resolve, reject) {
      logger('savePassTypeIdentifier', obj);

      if (!obj.cert) {
        reject({
          error: 'Must provide path to .p12 certificate'
        });
      }

      SignPass.createPems(obj.passTypeIdentifier, obj.cert, obj.passphrase, function(err, resp) {
        if (err) {
          reject(err);
        }
        logger('createPems', resp);
        program.db.put(resp).then(resolve, reject);

        //assert(fs.existsSync(options.key));
        //assert(fs.existsSync(options.cert));
        //resolve(resp);
      });
    });
  }

  // TODO: Save upload to database and move to data directory
  function saveUpload(file) {
    return new Promise(function(resolve, reject) {
      var toFilename = path.resolve(program.config.defaults.dataPath, './uploads/' + file.originalFilename);
      var _doc = {
        _id: 'file-' + file.name,
        originalFilename: file.originalFilename,
        path: toFilename,
        size: file.size,
        name: file.name,
        type: file.type
      };
      logger('saveUpload', _doc);

      fs.copy(file.path, _doc.path, function(err) {
        if (err) {
          reject(err);
        }
        program.db.put(_doc).then(resolve, reject);
      });
    });
  }

  Controller.post_passTypeIdentifier = function(req, res) {
    logger('Create pass type identifier', req.body, req.files);
    var out = {};


    if (req.files && req.files.file) {
      logger('Upload file', req.files);

      saveUpload(req.files.file).then(function(_file) {
        logger('Save file', _file);
        req.body.cert = _file.path;

        jpsPassbook.savePassTypeIdentifier(req.body).then(function(resp) {
          res.status(200).json(resp);
        }).catch(function(err) {
          logger('savePassTypeIdentifier - error', err);
          res.status(400).json(err);
        });

      }).catch(function(err) {
        logger('saveUpload - error', err);
        res.status(400).json(err);
      });


    } else {
      res.status(400).json({
        error: 'Please upload a .p12 file!'
      });
    }
  };

  return Controller;

  logger('initialized');

};
