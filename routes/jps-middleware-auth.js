'use strict';
module.exports = function(program, app) {
	const path = require('path');
	const flash = require('connect-flash');
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


	const urlencodedParser = bodyParser.urlencoded({
		extended: false
	});

	const User = require(path.resolve(__dirname, '../lib/models/user.js'));
	const Users = require(path.resolve(__dirname, '../lib/models/users.js'))(program.db);

	const config = program.config.defaults;
	const db = program.db;

	let router = new Router();
	let authLogger = program.getLogger('auth');

	const AuthController = program.require('controllers/auth-controller');
	let authController = new AuthController(program);


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
	router.get('/auth/github', passport.authenticate('github', {
		scope: [
			'user:email',
			'gist'
		]
	}), function(req, res) {});

	router.get('/auth/provider/callback', passport.authenticate('github', {
		failureRedirect: '/login'
	}), authController.get_provider_callback);

	router.get('/index', authController.get_index);
	router.get('/logout', authController.get_logout);

	//router.post('/login', urlencodedParser, authController.post_login);

	router.get('/login', authController.get_login);
	router.get('/signup', authController.get_register);

	//router.post('/signup', urlencodedParser, authController.post_register);
	router.post('/login', [urlencodedParser, bodyParser.json(), passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
	})]);

	router.post('/signup', [bodyParser.json(), passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash: true
	})]);

	router.post('/account', [bodyParser.json(), urlencodedParser, authController.ensureAuthenticated], authController.post_account);
	router.get('/account', authController.ensureAuthenticated, authController.get_account);
	router.get('/me', authController.ensureAuthenticated, authController.get_me);

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

	app.use(sess);
	app.set('views', path.resolve(__dirname, '../', './views'));
	app.set('view engine', 'ejs');
	app.engine('html', require('ejs').renderFile);
	app.use(require('connect-flash')());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(methodOverride());
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(router);

	if (app.get('env') === 'production' && sess.cookie) {
		app.set('trust proxy', 1) // trust first proxy
			//	sess.cookie.secure = true // serve secure cookies
	}
	authLogger('mounted!');
};
