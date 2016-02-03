'use strict';

module.exports = function(_, Logger, db) {
  let logger = Logger.getLogger('DbController');

  class DbController {
    get_doc(req, res, next) {
      let self = this;
      if (req.params.id) {
        db.get(req.params.id, req.params).then(function(resp) {
          res.status(200).json(resp);
        }).catch(function(err) {
          res.status(404).json(err);
        });
      } else {
        self.get_docs(req, res, next);
      }
    }
    get_docs(req, res, next) {
      db.allDocs(req.query).then(function(resp) {
        res.status(200).json(resp);
      }).catch(function(err) {
        res.status(400).json(err);
      });
    }
    put_doc(req, res, next) {
      _.defer(function() {
        db.put(req.body, req.params.id, req.query.rev).then(function(resp) {
          res.status(200).json(resp);
        }).catch(function(err) {
          res.status(404).json(err);
        });
      });
    }
    post_doc(req, res, next) {
      program.db.post(req.body).then(function(resp) {
        res.status(201).json(resp);
      }).catch(function(err) {
        res.status(400).json(err);
      });
    }
    delete_doc(req, res, next) {
      _.defer(function() {
        db.remove(req.params.id).then(function(resp) {
          res.sendStatus(200);
        }).catch(function(err) {
          res.sendStatus(404);
        });
      });
    }
  }

  return DbController;
};
