'use strict';
const path = require('path');
const url = require('url');
const express = require('express');
const expressValidator = require('express-validator');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const Router = express.Router;
const jsonParser = bodyParser.json();
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require(path.resolve(__dirname, '../models/user.js'));
module.exports = function (program) {

	const Users = require(path.resolve(__dirname, '../models/users.js'))(program.db);
	const config = program.config.defaults;
	const db = program.db;
	const logger = program.getLogger('AuthController');
	var GITHUB_CLIENT_ID = config.passport.development.github.clientID;
	var GITHUB_CLIENT_SECRET = config.passport.development.github.clientSecret;
	var OAUTH_CALLBACK_URL = config.passport.development.github.callbackURL;

	if (process.env.NODE_ENV === 'production') {
		GITHUB_CLIENT_ID = config.passport.production.github.clientID;
		GITHUB_CLIENT_SECRET = config.passport.production.github.clientSecret;
		OAUTH_CALLBACK_URL = config.passport.production.github.callbackURL;
	}

	const OAUTH_CLIENT_SECRET = GITHUB_CLIENT_SECRET;
	const OAUTH_CLIENT_ID = GITHUB_CLIENT_ID;
	const OAUTH_AUTH_URL = 'https://github.com/login/oauth/authorize';
	const OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';


	logger('OAUTH_CLIENT_SECRET', OAUTH_CLIENT_SECRET);
	logger('OAUTH_CLIENT_ID', OAUTH_CLIENT_ID);
	logger('OAUTH_AUTH_URL', OAUTH_AUTH_URL);
	logger('OAUTH_TOKEN_URL', OAUTH_TOKEN_URL);
	logger('OAUTH_CALLBACK_URL', OAUTH_CALLBACK_URL);


	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	passport.use('local-signup', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		function (req, email, password, done) {
			logger('local-signup', email);

			process.nextTick(function () {
				Users.find({
					'email': email
				}, function (err, user) {


					if (user) {
						logger('local-signup', 'error', 'found existing user', user);
						return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
					} else {
						logger('local-signup', 'registering', email);

						var newUser = new User({
							//username: email,
							email: email
						});
						newUser.password = newUser.generateHash(password);

						Users.save(newUser, function (err, u) {
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
			});
		}));
	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================
	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function (req, email, password, done) {
		logger('local-login', email);

		Users.findByEmail(email, function (err, user) {
			user = new User(user);
			logger('local-login', 'findOne', user);

			if (err) {
				logger('local-login', 'error', err);
				return done(err);
			}

			if (!user) {
				logger('local-login', 'No User Found!');
				return done(null, false, req.flash('loginMessage', 'No user found.'));
			}

			if (!user.checkPassword(password, user.password)) {
				logger('local-login', 'invalidePassword', user.password, password);
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
			}

			return done(null, user);
		});
	}));


	passport.use('oauth2', new OAuth2Strategy({
			authorizationURL: OAUTH_AUTH_URL,
			tokenURL: OAUTH_TOKEN_URL,
			clientID: OAUTH_CLIENT_ID,
			clientSecret: OAUTH_CLIENT_SECRET,
			callbackURL: OAUTH_CALLBACK_URL
		},
		function (accessToken, refreshToken, profile, done) {
			logger('accessToken', accessToken, refreshToken, profile);
			Users.findOrCreate(profile, done);
		}
	));

	passport.use('github', new GitHubStrategy({
			clientID: OAUTH_CLIENT_ID,
			clientSecret: OAUTH_CLIENT_SECRET,
			callbackURL: OAUTH_CALLBACK_URL
		},
		function (accessToken, refreshToken, profile, done) {
			process.nextTick(function () {
				logger('accessToken', accessToken);
				logger('refreshToken', refreshToken);
				logger('profile', profile);

				return Users.findOrCreate(profile, done);
			});
		}
	));

	passport.serializeUser(function (user, done) {
		logger('serializeUser', user);
		Users.findOrCreate(user, done);
	});

	passport.deserializeUser(function (id, done) {
		logger('deserializeUser', id);
		Users.find(id, done);
	});

	function restrict(req, res, next) {
		if (req.user) {
			return next();
		} else {
			res.send(403); // Forbidden
		}
	}

	function ensureAuthenticated(req, res, next) {
		logger('ensureAuthenticated', req.url);
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect(200, '/login')
	}

	// TODO: do any checks you want to in here
	function isAuthenticated(req, res, next) {
		logger('isAuthenticated', req.session);
		if (req.session && req.session.authenticated) {
			return next();
		}
		res.redirect(200, '/login');
	}

	let AuthController = {
		ensureAuthenticated: ensureAuthenticated,
		isAuthenticated: isAuthenticated,
		restrict: restrict,
		get_index: function (req, res, next) {
			res.render('index', {
				user: req.user
			});
		},
		get_login: function (req, res, next) {
			if (req.session) {
				logger('get_login', 'session', req.session);
			}
			if (req.user) {
				logger('get_login', 'user', req.user);
			}
			res.render('login', {
				user: req.user,
				message: req.flash('loginMessage', 'Please sign in')
			});

		},
		post_login: function (req, res, next) {
			logger('post_login', req.body);

			//  localAuth(req, res, next);
			if (req.user) {
				res.redirect('/account');
			}

			Users.validate(_user, function (err, resp) {
				if(err){
					res.format({
						html: function () {
							res.render('login', {
								user: req.user,
								message: req.flash('loginMessage', err.message)
							});
						},
						json: function () {
							res.status(200).json(resp);
						}
					});
				}
				res.format({
					html: function () {
						res.redirect('/account');
					},
					json: function () {
						res.status(200).json(resp);
					}
				});
			});
		},
		get_logout: function (req, res, next) {
			logger('get_logout');
			req.logout();
			res.render('login', {
				message: req.flash('loginMessage', 'You have been logged out.')
			});
		},
		get_me: function (req, res, next) {
			logger('get_me', req.url, req.session);
			res.status(200).json(req.user);
		},
		post_me: function (req, res, next) {
			logger('post_me', req.url, req.user);
			res.status(200).json(req.user);
		},
		get_provider: function (req, res, next) {
			logger('get_provider');
			passport.authenticate('oauth2');
		},
		get_provider_callback: function (req, res, next) {
			logger('get_provider_callback', req.url);
			res.redirect(200, '/account');
		},
		get_register: function (req, res, next) {
			logger('get_register');
			res.render('register', {
				message: req.flash('signupMessage')
			});
		},
		post_register: function (req, res, next) {
			logger('post_register', req.body);

			//user.password = user.generateHash(user.password);
			//  req.body.password = program.utils.checksum(req.body.password, 'sha1');
			logger('post_register', req.body);
			Users.findOrCreate(req.body, function (err, u) {
				if (err) {
					res.format({
						html: function () {
							res.render('register', {
								message: err
							});
						},
						json: function () {
							res.status(400).json(err);
						}
					});
				} else {
					res.format({
						html: function () {
							res.render('login', {
								message: 'User was created!'
							});
						},
						json: function () {
							res.status(200).json(u);
						}
					});
				}
			});
		},
		get_account: function (req, res, next) {
			if (req.isAuthenticated()) {
				logger('isAuthenticated');
			}
			req.authenticated = true;
			req.session.authenticated = true;
			req.session.save(function (err) {

				if (err) {
					throw err;
				}
				logger('session.save', req.session);
				logger('session.user', req.user);


				res.format({
					html: function () {
						res.render('account', {
							user: req.user
						});
					},
					json: function () {
						res.status(200).json({ok: true, data: req.user});
					}
				});

			});
		},
		post_account: function (req, res, next) {
			logger('post_account');
			//res.render('register', {});
			res.format({
				html: function () {
					res.render('login', {
						message: 'User was created!'
					});
				},
				json: function () {
					res.status(200).json({ok: true});
				}
			});
		}
	};

	return AuthController;
	logger('initialized');
};
