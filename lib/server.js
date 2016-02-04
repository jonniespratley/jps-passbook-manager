'use strict';
const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const flash = require('connect-flash');
const ejs = require('ejs');

class Server {

  constructor(config) {
    this.config = config;
    this.app = express();
    this.app.use('/public', serveStatic(path.resolve(__dirname, '../public')));
    this.app.use('/public', serveStatic(path.resolve(__dirname, '../app/bower_components')));
    this.app.use('/public', serveStatic(path.resolve(__dirname, this.config.publicDir)));
    this.app.use('/', serveStatic(path.resolve(__dirname, this.config.staticDir)));
    this.app.set('views', path.resolve(__dirname, '../views'));
    this.app.set('view engine', 'ejs');
    this.app.engine('html', ejs.renderFile);
    this.app.use(flash());
    console.log('Server', config);
    return this;
  }

  mount(middleware) {
    let self = this;
    let _routes = {};
    let routes = [
      path.resolve(__dirname, '../routes/jps-middleware-auth'),
      path.resolve(__dirname, '../routes/jps-middleware-admin'),
      path.resolve(__dirname, '../routes/jps-middleware-db'),
      path.resolve(__dirname, '../routes/jps-middleware-devices'),
      path.resolve(__dirname, '../routes/jps-middleware-passes')
    ];
    routes.concat(middleware);
    routes.forEach(function(m) {
      //require(m)(self, self.app);
      _routes[path.basename(m)] = m;
      console.log('routes', _routes);
    });


    return this.app;
  }

}

module.exports = Server;
