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


module.exports = function(program, app) {
	const User = require(path.resolve(__dirname, '../lib/models/user.js'));
	const Users = require(path.resolve(__dirname, '../lib/models/users.js'))(program.db);

	const config = program.config.defaults;
	const db = program.db;

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

	let router = new Router();
	let authLogger = program.getLogger('auth');

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


	passport.use(new LocalStrategy(function(username, password, done) {
		Users.findOne({
			username: username
		}, function(err, user) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, {
					message: 'Incorrect username.'
				});
			}
			/*
						if (!user.validPassword(password)) {
							return done(null, false, {
								message: 'Incorrect password.'
							});
						}*/
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
			authLogger('session.user', req.user);
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

	router.get('/register', function(req, res) {
		res.render('register', {
			user: req.user
		});
	});

	router.post('/register', function(req, res) {
		console.log('register', req.body);
		Users.findOrCreate(req.body, function(err, u) {
			if (err) {
				res.send(err);
			}
			res.status(200).send(u);
		})
	});

	router.get('/login', function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (err) {
				return next(err);
			}
			if (!user) {
				return res.redirect('/login');
			}
			req.logIn(user, function(err) {
				if (err) {
					return next(err);
				}
				return res.redirect('/users/' + user.username);
			});
		})(req, res, next);
	});

	router.get('/api/users/me',
		passport.authenticate('basic', {
			session: false
		}),
		function(req, res) {
			res.json({
				id: req.user.id,
				username: req.user.username
			});
		});

	router.post('/login',
		passport.authenticate('local'),
		function(req, res) {
			// If this function gets called, authentication was successful.
			// `req.user` contains the authenticated user.
			res.redirect('/users/' + req.user.username);
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

	let sess = session({
		//	store: new RedisStore(config.redis),
		name: config.name,
		secret: config.security.salt,
		proxy: true,
		resave: true,
		saveUninitialized: true
	});

	if (app.get('env') === 'production') {
		app.set('trust proxy', 1) // trust first proxy
		sess.cookie.secure = true // serve secure cookies
	}
	app.use(sess);

	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.set('views', path.resolve(__dirname, '../', './views'));
	app.set('view engine', 'ejs');
	app.engine('html', require('ejs').renderFile);

	app.use(bodyParser.json());
	app.use(methodOverride());

	app.use(passport.initialize());
	app.use(passport.session());


	app.use(router);

	authLogger('mounted!');
};
