'use strict';
module.exports = function(program) {
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

  function localAuth() {
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
    })
  }

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

      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect password.'
        });
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
    function(accessToken, refreshToken, profile, done) {
      logger('accessToken', accessToken, refreshToken, profile);
      Users.findOrCreate(profile, done);
    }
  ));

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

  passport.serializeUser(function(user, done) {
    logger('serializeUser', user);
    Users.findOrCreate(user, done);
  });

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
    res.redirect('/login')
  }

  // TODO: do any checks you want to in here
  function isAuthenticated(req, res, next) {
    logger('isAuthenticated', req.session);
    if (req.session && req.session.authenticated) {
      return next();
    }
    res.redirect('/login');
  }

  let AuthController = {
    get_index: function(req, res, next) {
      res.render('index', {
        user: req.user
      });
    },

    get_login: function(req, res, next) {

      res.render('login', {
        user: req.user
      });
    },

    post_login: function(req, res, next) {
      // If this function gets called, authentication was successful.
      // `req.user` contains the authenticated user.
      res.redirect('/users/' + req.user.username);
    },

    get_logout: function(req, res, next) {
      req.logout();
      res.redirect('/login');
    },

    get_me: function(req, res, next) {
      logger(req.url, req.session);
      res.status(200).json(req.session);
    },

    post_me: function(req, res, next) {
      logger(req.url, req.session);
      res.status(200).json(req.session);
    },
    get_provider: function(req, res, next) {
      passport.authenticate('oauth2');
    },
    get_callback: function(req, res, next) {

    },
    get_register: function(req, res, next) {
      logger('get_register');
      res.render('register', {});
    },
    post_register: function(req, res, next) {
      console.log('register', req.body);
      Users.findOrCreate(req.body, function(err, u) {
        if (err) {
          //  res.status(400).json(err);
          res.render('register', {
            error: err
          });
        } else {
          res.render('login', {
            results: u
          });
        }
        //res.status(200).send(u);
      })
    },
    get_account: function(req, res, next) {
      if (req.isAuthenticated()) {
        logger('isAuthenticated');
      }
      req.authenticated = true;
      req.session.authenticated = true;
      req.session.save(function(err) {

        if (err) {
          throw err;
        }
        logger('session.save', req.session);
        logger('session.user', req.user);

        res.render('account', {
          user: req.user
        });

      });
    },
    post_account: function(req, res, next) {
      logger('post_account');
      res.render('register', {});
    }
  };

  return AuthController;
  logger('initialized');
};
