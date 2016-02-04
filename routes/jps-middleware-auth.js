'use strict';
module.exports = function (path, config, Router, app, AuthController, Logger) {
	const flash = require('connect-flash');
	const express = require('express');
	const methodOverride = require('method-override');
	const bodyParser = require('body-parser');
	const passport = require('passport');
	const urlencodedParser = bodyParser.urlencoded({
		extended: false
	});

	const authLogger = Logger.getLogger('auth');
	//const AuthController = program.require('controllers/auth-controller');
	let router = new Router();


	/*	router.get('/auth/provider/callback',
	 passport.authenticate('oauth2', {
	 failureRedirect: '/login'
	 }),
	 function(req, res) {
	 authLogger('/auth/provider/callback', req.account, req.user);
	 // Successful authentication, redirect home.
	 res.redirect('/account');
	 });*/
	router.get('/auth/github', passport.authenticate('github', {
		scope: [
			'user:email',
			'gist'
		]
	}), function (req, res) {});

	router.get('/auth/provider/callback', passport.authenticate('github', {
		failureRedirect: '/login'
	}), AuthController.get_provider_callback);

	router.get('/index', AuthController.get_index);
	router.get('/logout', AuthController.get_logout);

	router.get('/login', AuthController.get_login);
	router.get('/signup', AuthController.get_register);
	router.post('/account', [bodyParser.json(), urlencodedParser, AuthController.ensureAuthenticated], AuthController.post_account);
	router.get('/account', AuthController.ensureAuthenticated, AuthController.get_account);
	router.get('/me', AuthController.ensureAuthenticated, AuthController.get_me);

	//router.post('/signup', urlencodedParser, AuthController.post_register);
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

	app.use(function (req, res, next) {
		res.locals.user = req.user;
		res.locals.session = req.session;
		res.locals.authenticated = !req.authenticated;
		next();
	});

	const session = require('express-session');
	//const RedisStore = require('connect-redis')(session);
	let sess = session({
		//	store: new RedisStore(config.redis),
		name: config.name,
		secret: config.security.salt,
		proxy: true,
		resave: true,
		saveUninitialized: true,
		cookie: {
			secure: false
		}
	});

	if (app.get('env') === 'production') {
		app.set('trust proxy', 1);

		try {
			sess.cookie.secure = true;
		} catch (e) {
			console.error( 'Cookie.secure error', e);
		}
	}

	app.use(sess);
	app.set('views', path.resolve(__dirname, '../', './views'));
	app.set('view engine', 'ejs');
	app.engine('html', require('ejs').renderFile);


	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(router);

	authLogger('mounted!');
};
