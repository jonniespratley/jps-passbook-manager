'use strict';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "96943ce4c9b4f09bf98f";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "f9809160c20f1f57876924c015aa68283f1c4a4b";

const express = require('express');

const expressValidator = require('express-validator');
const methodOverride = require('method-override');
const session = require('express-session');
const bodyParser = require('body-parser');

const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;


module.exports = function(program, app) {
	if (!app) {
		throw new Error('Must provide an express app as argument 2');
	}
	var Router = express.Router;
	var jsonParser = bodyParser.json();
	var config = program.config.defaults;
	var db = program.db;
	var router = new Router();
	var authLogger = program.getLogger('auth');



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


	var User = {
		saveOrCreate: function(user, done) {
			authLogger('saveOrCreate', user);
			db.put(user).then(function(u) {
				done(null, u._id);
			}).catch(function(err) {
				done(err, null);
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

		db.put(user).then(function(u) {
			done(null, u);
		}).catch(function(err) {
			done(err, null);
		});
	});

	passport.deserializeUser(function(id, done) {
		authLogger('deserializeUser', id);
		db.get(id).then(function(u) {
			done(null, u);
		}).catch(function(err) {
			done(err, null);
		});
		//	done(null, obj);
	});


	function findOrCreate(profile, done) {
		console.warn('findOrCreate', profile);
		done(null, profile);
	}


	// Use the GitHubStrategy within Passport.
	//   Strategies in Passport require a `verify` function, which accept
	//   credentials (in this case, an accessToken, refreshToken, and GitHub
	//   profile), and invoke a callback with a user object.
	passport.use(new GitHubStrategy({
			clientID: GITHUB_CLIENT_ID,
			clientSecret: GITHUB_CLIENT_SECRET,
			callbackURL: "https://passbook-manager.run.aws-usw02-pr.ice.predix.io/auth/github/callback"
		},
		function(accessToken, refreshToken, profile, done) {

			// asynchronous verification, for effect...
			process.nextTick(function() {
				authLogger('accessToken', accessToken);
				authLogger('refreshToken', refreshToken);
				authLogger('profile', profile);
				return findOrCreate(profile, done);

				// To keep the example simple, the user's GitHub profile is returned to
				// represent the logged-in user.  In a typical application, you would want
				// to associate the GitHub account with a user record in your database,
				// and return that user instead.
				//	return done(null, profile);
			});
		}
	));



	//app.use(express.static(__dirname + '/public'));
	router.get('/admin', function(req, res) {
		res.render('index', {
			user: req.user
		});
	});

	router.get('/account', ensureAuthenticated, function(req, res) {
		res.render('account', {
			user: req.user
		});
	});
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	router.get('/login', function(req, res) {
		res.render('login', {
			user: req.user
		});
	});

	// GET /auth/github
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  The first step in GitHub authentication will involve redirecting
	//   the user to github.com.  After authorization, GitHub will redirect the user
	//   back to this application at /auth/github/callback
	router.get('/auth/github', passport.authenticate('github', {
			scope: ['user:email']
		}),
		function(req, res) {});

	// GET /auth/github/callback
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function will be called,
	//   which, in this example, will redirect the user to the home page.
	router.get('/auth/github/callback',
		passport.authenticate('github', {
			failureRedirect: '/login'
		}),
		function(req, res) {
			authLogger('github-callback', req.url);

			res.redirect('/admin');
		});

	//	app.use(partials());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.use(session({
		secret: config.security.salt,
		resave: false,
		saveUninitialized: false
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(router);
	//authLogger('mounted!');
};
