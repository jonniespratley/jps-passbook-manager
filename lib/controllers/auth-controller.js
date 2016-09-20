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

module.exports = function(program) {

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
		function(req, email, password, done) {
			logger('local-signup', email);
			//	log.info('local-signup', email, password);
			process.nextTick(function() {
				Users.register(email, password, done);
			});
		}));
	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================
	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, email, password, done) {
		logger('local-login', email);
		Users.login(email, password, done);
	}));

	/**
	 *
	 */
	passport.use('oauth2', new OAuth2Strategy({
			authorizationURL: OAUTH_AUTH_URL,
			tokenURL: OAUTH_TOKEN_URL,
			clientID: OAUTH_CLIENT_ID,
			clientSecret: OAUTH_CLIENT_SECRET,
			callbackURL: OAUTH_CALLBACK_URL
		},
		function(accessToken, refreshToken, profile, done) {
			logger('accessToken', accessToken, refreshToken, profile);
			Users.findOrCreate(profile, done);
		}
	));

	/**
	 *
	 */
	passport.use('github', new GitHubStrategy({
			clientID: OAUTH_CLIENT_ID,
			clientSecret: OAUTH_CLIENT_SECRET,
			callbackURL: OAUTH_CALLBACK_URL
		},
		function(accessToken, refreshToken, profile, done) {
			process.nextTick(function() {
				logger('accessToken', accessToken);
				logger('refreshToken', refreshToken);
				logger('profile', profile);

				return Users.findOrCreate(profile, done);
			});
		}
	));

	/**
	 *
	 */
	passport.serializeUser(function(user, done) {
		logger('serializeUser', user);
		Users.findOrCreate(user, done);
	});

	/**
	 *
	 */
	passport.deserializeUser(function(id, done) {
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
		get_index: function(req, res, next) {
			res.render('index', {
				user: req.user
			});
		},
		get_login: function(req, res, next) {
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
		post_login: function(req, res, next) {
			//	logger('post_login', req.body);

			//  localAuth(req, res, next);
			if (req.user) {
				//return res.redirect('/account');
			}
			req.is('json');
			var _user = req.body;

			Users.login(_user.email, _user.password, function(err, resp) {
				if (err) {
					res.status(400).send(err);
				} else {
					res.status(200).send(resp);
				}

			});
		},
		get_logout: function(req, res, next) {
			logger('get_logout');
			req.logout();
			res.redirect('/login');
		},
		get_me: function(req, res, next) {
			logger('get_me', req.url, req.session);

			res.format({
				'text/plain': function() {
					res.send('hey');
				},
				'text/html': function() {
					res.render('account', req.user);
				},
				'application/json': function() {
					res.status(200).json(req.user);
				},

				'default': function() {
					res.status(406).send('Not Acceptable');
				}
			});
		},
		post_me: function(req, res, next) {
			logger('post_me', req.url, req.user);
			res.status(200).json(req.user);
		},
		get_provider: function(req, res, next) {
			logger('get_provider');
			passport.authenticate('oauth2');
		},
		get_provider_callback: function(req, res, next) {
			logger('get_provider_callback', req.url);
			res.redirect(200, '/account');
		},
		get_register: function(req, res, next) {
			logger('get_register');
			res.render('register', {
				message: req.flash('signupMessage')
			});
		},
		post_register: function(req, res, next) {
			logger('post_register', req.body);

			//user.password = user.generateHash(user.password);
			//  req.body.password = program.utils.checksum(req.body.password, 'sha1');
			logger('post_register', req.body);
			Users.findOrCreate(req.body, function(err, u) {
				if (err) {
					res.format({
						'text/html': function() {
							res.render('register', {
								message: err
							});
						},
						'application/json': function() {
							res.status(400).json(err);
						}
					});
				} else {
					res.format({
						'text/html': function() {
							res.render('login', {
								message: 'User was created!'
							});
						},
						'application/json': function() {
							res.status(200).json(u);
						}
					});
				}
			});
		},
		get_account: function(req, res, next) {
			if (req.isAuthenticated()) {
				logger('isAuthenticated');
			}
			req.authenticated = true;
			req.session.authenticated = true;
			req.session.save(function(err) {
				if (err) {
					console.log("Session save error", err);
					throw err;
				}

				logger('session.save', req.session);
				logger('session.user', req.user);

				res.format({
					'text/plain': function() {
						res.send('hey');
					},
					'text/html': function() {
						res.render('account', {
							user: req.user
						});
					},
					'application/json': function() {
						res.status(200).json({
							ok: true,
							data: req.user
						});
					},

					'default': function() {
						res.status(406).send('Not Acceptable');
					}
				});
			});
		},
		post_account: function(req, res, next) {
			logger('post_account');
			//res.render('register', {});
			res.format({
				html: function() {
					res.render('login', {
						message: 'User was created!'
					});
				},
				json: function() {
					res.status(200).json({
						ok: true
					});
				}
			});
		}
	};

	return AuthController;
	logger('initialized');
};
