'use strict';
module.exports = function(program) {
  const path = require('path');
  const fs = require('fs-extra');
  const jpsPassbook = program.require('jps-passbook')(program);
  const SignPass = program.require('signpass');

  let logger = program.getLogger('AdminController');
  let Controller = {};



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

        req.body.p12 = _file.path;

        jpsPassbook.savePassTypeIdentifier(req.body, function(err, resp) {

          if (err) {
            logger('savePassTypeIdentifier - error', err);
            res.status(400).json(err);
          }

          res.status(200).json(resp);
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

  Controller.get_downloadPass = function(req, res) {
    var id = req.params.id;
    if (id) {
      logger('id', id);

      program.db.get(id).then(function(resp) {
        logger('found pass', resp._id);

        res.set('Content-Type', 'application/vnd.apple.pkpass')
          .status(200)
          .download(resp.pkpassFilename);
      }).catch(function(err) {
        res.status(404).json(err);
      });
    } else {
      res.status(400).json('Must provide id!');
    }
  };

  Controller.get_signPass = function(req, res) {
    var id = req.params.id
    logger('sign_pass', id);

    program.db.get(id).then(function(resp) {

      logger('found pass', resp);

      jpsPassbook.createPass(resp, function(err, p) {

        if (err) {
          logger('savePassTypeIdentifier - error', err);
          res.status(400).json(err);
        }
        res.status(200).json(p);
        /*
        res.set('Content-Type', 'application/vnd.apple.pkpass')
          .status(200)
          .download(p.dest);*/
      });
      //	res.status(200).json(resp);
    }).catch(function(err) {
      res.status(404).json(err);
    });
  };

  Controller.get_find = function(req, res) {
    program.db.find(req.query).then(function(resp) {
      res.status(200).json(resp);
    }).catch(function(err) {
      res.status(400).json(err);
    });
  };

  return Controller;

  logger('initialized');

};
