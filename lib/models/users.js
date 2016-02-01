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
        done(null, new User(u));
      }).catch(function(err) {
        logger('find', 'error', err);
        done(err, null);
      });
    },
    findOrCreate: function(profile, done) {
      var user = new User(profile);
      logger('findOrCreate', user._id);

      db.get(user._id).then(function(u) {
        logger('findOrCreate', 'found', u);
        done(null, new User(u));
      }).catch(function(err) {
        logger('findOrCreate', 'error', err);

        db.put(user).then(function(u) {
          done(null, user);

        }).catch(function(err) {
          done(err, null);
        });

      });
    }
  };

  return Users
};
