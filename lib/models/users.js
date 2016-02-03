'use strict';
var _ = require('lodash');
var User = require('./user');
var logger = require('../utils').getLogger('Users');

module.exports = function (db) {
	var Users = {
		validate: function (user, done) {
			let self = this;
			user = new User(user);
			user.password = user.generateHash(user.password);
			logger('validate', user);

			self.findByUsername(user.username, done);
		},

		create: function (user, done) {
			user = new User(user);
			user.password = user.generateHash(user.password);
			logger('save', user);

			db.put(user).then(function (resp) {
				logger('save', 'success', resp);
				done(null, new User(resp));
			}).catch(function (err) {
				done(err);
			});
		},

		save: function (user, done) {
			logger('save', user);
			user = new User(user);
			if (user.password2) {
				user.password = user.generateHash(user.password2);
			}
			db.put(user).then(function (resp) {
				logger('save', 'success', resp);
				done(null, resp);
			}).catch(function (err) {
				done(err);
			});
		},

		findOne: function (params, done) {
			logger('findOne', params);
			let _user = null;
			this.find(params, function (err, resp) {
				if (err) {
					done(err);
				}
				logger('findOne', 'success', resp);
				_user = new User(_(resp).first());
				done(null, _user);
			});
		},

		findByUsername: function (username, done) {
			return this.findOne({
				username: username
			}, done);
		},

		findByEmail: function (email, done) {
			return this.findOne({
				email: email
			}, done);
		},

		find: function (params, done) {
			logger('find', params);
			db.find(params).then(function (resp) {
				done(null, resp);
			}).catch(function (err) {
				logger('find', 'error', err);
				done(err);
			});
		},

		findOrCreate: function (profile, done) {
			logger('findOrCreate', profile);
			let self = this;
			//	profile = new User(profile);
			self.find({
				username: profile.username
			}, function (err, u) {
				if (err) {
					logger('findOrCreate', 'not found - creating', profile);
					self.create(profile, done);
				} else {
					done(null, u);
				}
			});
		},

		getUsers: function () {
			return db.allDocs();
		}
	};

	return Users;
};
