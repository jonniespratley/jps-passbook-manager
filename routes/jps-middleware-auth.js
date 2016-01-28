'use strict';
const url = require('url');
const express = require('express');
const expressValidator = require('express-validator');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github2').Strategy;



var GITHUB_PRODUCTION_CLIENT_ID = '96943ce4c9b4f09bf98f';
var GITHUB_PRODUCTION_CLIENT_SECRET = 'f9809160c20f1f57876924c015aa68283f1c4a4b';
var GITHUB_DEV_CLIENT_ID = '7171ef010ffc067de767';
var GITHUB_DEV_CLIENT_SECRET = '387c9cd85b4c48abcaa7547bf2865aaf922e4ac2';
var GITHUB_CLIENT_ID = GITHUB_DEV_CLIENT_ID;
var GITHUB_CLIENT_SECRET = GITHUB_DEV_CLIENT_SECRET;
if (process.env.NODE_ENV === 'production') {
	GITHUB_CLIENT_ID = GITHUB_PRODUCTION_CLIENT_ID;
	GITHUB_CLIENT_SECRET = GITHUB_PRODUCTION_CLIENT_SECRET;
}


module.exports = function(program, app) {

	const Router = express.Router;
	const jsonParser = bodyParser.json();
	const User = program.require('models/user');
	var config = program.config.defaults;
	var db = program.db;

	const OAUTH_CALLBACK_URL = url.format({
		protocol: (process.env.VCAP_APP_HOST ? 'https' : 'http'),
		hostname: process.env.VCAP_APP_HOST || process.env.IP || config.server.hostname || '127.0.0.1',
		port: process.env.PORT || config.server.port || 8080,
		pathname: '/auth/provider/callback'
	});


	const OAUTH_CLIENT_SECRET = GITHUB_CLIENT_SECRET;
	const OAUTH_CLIENT_ID = GITHUB_CLIENT_ID;
	const OAUTH_AUTH_URL = 'https://github.com/login/oauth/authorize';
	const OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';

	var router = new Router();
	var authLogger = program.getLogger('auth');

	authLogger('OAUTH_CLIENT_SECRET', OAUTH_CLIENT_SECRET);
	authLogger('OAUTH_CLIENT_ID', OAUTH_CLIENT_ID);
	authLogger('OAUTH_AUTH_URL', OAUTH_AUTH_URL);
	authLogger('OAUTH_TOKEN_URL', OAUTH_TOKEN_URL);
	authLogger('OAUTH_CALLBACK_URL', OAUTH_CALLBACK_URL);

	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
		authLogger('ensureAuthenticated', req.url);
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login')
	}

	// TODO: do any checks you want to in here
	function isAuthenticated(req, res, next) {
		authLogger('isAuthenticated', req.session);
		if (req.session && req.session.authenticated) {
			return next();
		}
		res.redirect('/login');
	}


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


	// Passport session setup.
	//   To support persistent login sessions, Passport needs to be able to
	//   serialize users into and deserialize users out of the session.  Typically,
	//   this will be as simple as storing the user ID when serializing, and finding
	//   the user by ID when deserializing.  However, since this example does not
	//   have a database of user records, the complete GitHub profile is serialized
	//   and deserialized.
	passport.serializeUser(function(user, done) {
		authLogger('serializeUser', user);
		Users.findOrCreate(user, done);
	});

	passport.deserializeUser(function(id, done) {
		authLogger('deserializeUser', id);
		Users.find(id, done);
	});

	passport.use('oauth2', new OAuth2Strategy({
			authorizationURL: OAUTH_AUTH_URL,
			tokenURL: OAUTH_TOKEN_URL,
			clientID: OAUTH_CLIENT_ID,
			clientSecret: OAUTH_CLIENT_SECRET,
			callbackURL: OAUTH_CALLBACK_URL
		},
		function(accessToken, refreshToken, profile, done) {
			authLogger('accessToken', accessToken, refreshToken, profile);
			Users.findOrCreate(profile, done);
		}
	));

	router.get('/auth/provider', passport.authenticate('oauth2'));

	/*	router.get('/auth/provider/callback',
			passport.authenticate('oauth2', {
				failureRedirect: '/login'
			}),
			function(req, res) {
				authLogger('/auth/provider/callback', req.account, req.user);
				// Successful authentication, redirect home.
				res.redirect('/account');
			});*/

	// Use the GitHubStrategy within Passport.
	passport.use('github', new GitHubStrategy({
			clientID: OAUTH_CLIENT_ID,
			clientSecret: OAUTH_CLIENT_SECRET,
			callbackURL: OAUTH_CALLBACK_URL
		},
		function(accessToken, refreshToken, profile, done) {
			process.nextTick(function() {
				authLogger('accessToken', accessToken);
				authLogger('refreshToken', refreshToken);
				authLogger('profile', profile);

				return Users.findOrCreate(profile, done);
			});
		}
	));

	router.get('/auth/github', passport.authenticate('github', {
		scope: [
			'user:email',
			'gist'
		]
	}), function(req, res) {});

	router.get('/auth/provider/callback',
		passport.authenticate('github', {
			failureRedirect: '/login'
		}),
		function(req, res) {
			authLogger('github-callback', req.url);
			res.redirect('/account');
		});

	//app.use(express.static(__dirname + '/public'));
	router.get('/index', function(req, res) {
		res.render('index', {
			user: req.user
		});
	});

	// TODO: Handle get
	router.get('/account', ensureAuthenticated, function(req, res) {
		if (req.isAuthenticated()) {
			console.log('isAuthenticated');
		}
		req.authenticated = true;
		req.session.authenticated = true;
		req.session.save(function(err) {
			authLogger('session.save', req.session);
			if (err) {
				throw err;
			}
			res.render('account', {
				user: req.user
			});
		});
	});

	var urlencodedParser = bodyParser.urlencoded({
		extended: false
	})

	// TODO: Handle post certs
	router.post('/account', [urlencodedParser, isAuthenticated], function(req, res) {
		console.log('file', req.file);
		res.render('account', {
			message: 'File uploaded!'
		});
	});

	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});

	router.get('/login', function(req, res) {
		res.render('login', {
			user: req.user
		});
	});

	app.get('/api/' + config.version + '/me', function(req, res, next) {
		authLogger(req.url, req.session);
		res.status(200).json(req.session);
	});

	app.use(function(req, res, next) {
		res.locals.user = req.user;
		res.locals.session = req.session;
		res.locals.authenticated = !req.authenticated;

		next();
	});
	app.use(session({
		//	store: new RedisStore(config.redis),
		secret: config.security.salt,
		resave: true,
		saveUninitialized: true
	}));
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(router);

	authLogger('mounted!');
};
