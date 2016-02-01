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

      this.find(profile, function(err, u) {
        if(err){
          logger('findOrCreate', 'not found - creating', profile);
          db.put(new User(profile)).then(function(resp) {
            logger('findOrCreate', 'create - success', profile);
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
