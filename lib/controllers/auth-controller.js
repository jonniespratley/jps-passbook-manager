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

  function localAuth(req, res, next) {
    logger('localAuth', req.body);

    passport.authenticate(function(err, user, info) {
      if (err) {
        logger('localAuth', 'login - error', err);
        return next(err);
      }
      if (!user) {
        return res.redirect('/login');
      }
      logger('localAuth', 'login', user);
      req.logIn(user, function(err) {
        if (err) {
          logger('localAuth', 'login - error', err);
          return next(err);
        }
        return res.redirect('/users/' + user.username);
      });
    })
  }

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        Users.findOne({
          'local.email': email
        }, function(err, user) {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if theres already a user with that email
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {

            // if there is no user with that email
            // create the user
            var newUser = new User();

            // set the user's local credentials
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);

            // save the user
            newUser.save(function(err) {
              if (err) {
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      });
    }));
  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, function(req, email, password, done) { // callback with email and password from our form

    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    Users.findOne({
      'local.email': email
    }, function(err, user) {
      // if there are any errors, return the error before anything else
      if (err) {
        return done(err);
      }

      // if no user is found, return the message
      if (!user) {
        // req.flash is the way to set flashdata using connect-flash
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }


      // if the user is found but the password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
      }


      // all is well, return successful user
      return done(null, user);
    });

  }));

  passport.use('local', new LocalStrategy(function(username, password, done) {
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
        user: req.user
      });
    },
    post_login: function(req, res, next) {
      logger('post_login', req.body);
      localAuth(req, res, next);
      if (req.user) {
        //res.redirect('/account');
      }
    },
    get_logout: function(req, res, next) {
      logger('get_logout');
      req.logout();
      res.redirect('/login');
    },
    get_me: function(req, res, next) {
      logger('get_me', req.url, req.session);
      res.status(200).json(req.user);
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
      res.redirect('/account');
    },
    get_callback: function(req, res, next) {

    },
    get_register: function(req, res, next) {
      logger('get_register');
      res.render('register', {});
    },
    post_register: function(req, res, next) {
      var user = new User(req.body);
      user.password = user.generateHash(req.body.password);
      //  req.body.password = program.utils.checksum(req.body.password, 'sha1');
      logger('post_register', user);
      Users.findOrCreate(user, function(err, u) {
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
