'use strict';
module.exports = function(db) {

  var Users = {
    find: function(profile, done) {
      var user = new User(profile);
      authLogger('find', user._id);
      db.get(user._id).then(function(u) {
        authLogger('find', 'found', u._id);
        done(null, u);
      }).catch(function(err) {
        authLogger('find', 'error', err);
        done(err, null);
      });
    },
    findOrCreate: function(profile, done) {
      var user = new User(profile);
      authLogger('findOrCreate', user._id);
      db.get(user._id).then(function(u) {
        authLogger('findOrCreate', 'found', u._id);
        done(null, u);
      }).catch(function(err) {
        authLogger('findOrCreate', 'error', err);
        db.put(user).then(function(u) {
          done(null, u);
        }).catch(function(err) {
          done(err, null);
        });

      });
    }
  };

  return Users
};
