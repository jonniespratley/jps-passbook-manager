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

  const logger = program.getLogger('AuthController');


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
    index: function(req, res, next) {
      res.render('index', {
        user: req.user
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
          throw err;
        }
        logger('session.save', req.session);
        logger('session.user', req.user);

        res.render('account', {
          user: req.user
        });

      });
    },
    get_login: function(req, res, next) {
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
    }
  };

  return AuthController;
  logger('initialized');
};
