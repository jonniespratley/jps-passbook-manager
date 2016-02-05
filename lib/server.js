'use strict';

const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const flash = require('connect-flash');
const ejs = require('ejs');

class Server {

  constructor(program) {
    this.config = program.get('config');
    this.app = express();
    this.app.set('views', path.resolve(__dirname, '../views'));
    this.app.set('view engine', 'ejs');
    this.app.engine('html', ejs.renderFile);
	  this.app.set('program', program);

    return this;
  }

  mount(middleware) {
    let _routes = {};
    let routes = [];
    routes.concat(middleware);
    routes.forEach(function(m) {
      _routes[path.basename(m)] = m;
      console.log('mount', m);
    });

    this.app.use('/public', serveStatic(path.resolve(__dirname, '../public')));
    this.app.use('/public', serveStatic(path.resolve(__dirname, '../app/bower_components')));
    this.app.use('/public', serveStatic(path.resolve(__dirname, this.config.publicDir)));
    this.app.use('/', serveStatic(path.resolve(__dirname, this.config.staticDir)));
    this.app.use(flash());

    return this.app;
  }

  use(name, file){
    console.log('Server.use', name, file);
    return this.app.use(name, file);
  }

}

module.exports = Server;
