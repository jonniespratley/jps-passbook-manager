'use strict';
module.exports = function(program) {
  const _ = require('lodash');
  let logger = program.getLogger('DbController');
  var Controller = {};
  Controller = {

    get_doc: function(req, res, next) {
      if (req.params.id) {
        program.db.get(req.params.id, req.params).then(function(resp) {
          res.status(200).json(resp);
        }).catch(function(err) {
          res.status(400).json(err);
        });
      } else {
        Controller.get_docs(req, res, next);
      }

    },
    get_docs: function(req, res, next) {
      program.db.allDocs(req.query).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(400).json(err);
      });
    },
    put_doc: function(req, res, next) {
      _.defer(function() {
        program.db.put(req.body, req.params.id, req.query.rev).then(function(resp) {
          res.status(200).json(resp);
        }).catch(function(err) {
          res.status(404).json(err);
        });
      });
    },
    post_doc: function(req, res, next) {
      program.db.post(req.body).then(function(resp) {
        res.status(201).json(resp);
      }).catch(function(err) {
        res.status(400).json(err);
      });
    },
    delete_doc: function(req, res, next) {
      _.defer(function() {
        program.db.remove(req.params.id).then(function(resp) {
          res.sendStatus(200);
        }).catch(function(err) {
          res.sendStatus(404);
        });
      });
    }
  };

  return Controller;
  logger('initialized');
};
