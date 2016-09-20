'use strict';

const _ = require('lodash');
const User = require('./user');
const logger = require('../utils').getLogger('Users');

module.exports = function(db) {

	var Users = {
		validate: function(user, done) {
			let self = this;
			user = new User(user);
			user.password = user.generateHash(user.password);
			logger('validate', user);
			self.findByUsername(user.username, done);
		},

		create: function(user, done) {
			user = new User(user);
			user.password = user.generateHash(user.password);
			logger('save', user);
			db.put(user).then(function(resp) {
				logger('save', 'success', resp);
				done(null, new User(resp));
			}).catch(function(err) {
				done(err);
			});
		},

		save: function(user, done) {
			logger('save', user);
			user = new User(user);
			db.put(user).then(function(resp) {
				logger('save', 'success', resp);
				done(null, resp);
			}).catch(function(err) {
				done(err);
			});
		},

		findOne: function(params, done) {
			logger('findOne', params);
			let _user = null;
			db.find(params).then(function(resp) {
				_user = new User(_(resp).first());
				logger('findOne', 'success', _user);
				done(null, _user);
			}).catch(done);
		},

		findByUsername: function(username, done) {
			return this.findOne({
				username: username
			}, done);
		},

		findByEmail: function(email, done) {
			return this.findOne({
				email: email
			}, done);
		},

		find: function(params, done) {
			logger('find', params);
			this.findOne(params, done);
		},

		findOrCreate: function(profile, done) {
			let self = this;
			profile = new User(profile);
			logger('findOrCreate', profile.id);

			db.find({
				id: profile.id
			}).then(function(resp) {
				logger('findOrCreate.found', resp._id);
				done(null, resp);
			}).catch(function(err) {
				self.create(profile, done);
			});
		},

		getUsers: function(done) {
			db.allDocs({
				docType: 'user'
			}).then(function(resp) {
				done(null, resp);
			}).catch(function(err) {
				done(err);
			});
		},

		login: function(email, password, done) {
			this.findByEmail(email, function(err, user) {
				user = new User(user);
				logger('local-login', 'findOne', user);

				if (err) {
					logger('local-login', 'error', err);
					return done(err);
				}

				if (!user) {
					logger('local-login', 'No User Found!');
					return done(null, false);
				}
				if (!user.checkPassword(password, user.password)) {
					logger('local-login', 'invalidePassword', user.password, password);
					return done(null, false);
				}
				return done(null, user);
			});
		},

		register: function(email, password, done) {
			var self = this;
			self.find({
				'email': email
			}, function(err, user) {
				if (user) {
					logger('local-signup', 'error', 'found existing user', user);
					return done(null, false);
				} else {
					logger('local-signup', 'registering', email);

					var newUser = new User({
						//username: email,
						email: email
					});
					newUser.password = newUser.generateHash(password);

					self.save(newUser, function(err, u) {
						if (err) {
							logger('saveUser', 'error', err);
							throw err;
						}
						if (err) {
							logger('local-signup', 'error', 'Fatal error');
							return done(err);
						}
						logger('local-signup', 'success', u);
						return done(null, u);
					});
				}
			});
		}
	};

	return Users;
};
