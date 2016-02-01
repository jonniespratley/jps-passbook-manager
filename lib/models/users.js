'use strict';
var User = require('./user');
var logger = require('../utils').getLogger('Users');

module.exports = function(db) {
  var Users = {

    findOne: function(username, done) {
      logger('findOne', username);
      return this.find({
        username: username
      }, done);
    },

    find: function(profile, done) {
      var user = new User(profile);
      logger('find', user._id);
      db.get(user._id).then(function(u) {
        logger('find', 'found', u._id);
        done(null, u);
      }).catch(function(err) {
        logger('find', 'error', err);
        done(err);
      });
    },

    findOrCreate: function(profile, done) {
      logger('findOrCreate', profile);
      let newUser = new User(profile);
      this.find(newUser, function(err, u) {
        if (err) {
          logger('findOrCreate', 'not found - creating', newUser);
          db.put(newUser).then(function(resp) {
            logger('findOrCreate', 'create - success', resp);
            done(null, resp);
          }).catch(function(err) {
            done(err);
          });
        } else {
          done(null, u);
        }
      });
    }
  };

  return Users;
};
