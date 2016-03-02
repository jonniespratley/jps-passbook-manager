'use strict';
const express = require('express');
const serveStatic = require('serve-static');
const flash = require('connect-flash');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');

module.exports = function(app, BlogService, BlogController) {
  var blog = express();
  var blogAdmin = express();

  blog.set('views', path.resolve(__dirname, './views'));
  blog.set('view engine', 'ejs');
  blog.engine('html', ejs.renderFile);

  blog.use('/', serveStatic(path.resolve(__dirname, './views')));
  blog.use(flash());

  blog.get('/', BlogController.index);
  blog.get('/posts', BlogController.renderPosts);
  blog.get('/posts/:id', BlogController.renderPost);
  blog.delete('/posts/:id', BlogController.remove)
  blog.put('/posts/:id', bodyParser.json(), BlogController.put)
  blog.post('/posts', bodyParser.json(), BlogController.post)
  blog.route('/:id?').get(BlogController.get);

  blogAdmin.route('/:id?')
    .get(BlogController.get)
    .put(bodyParser.json(), BlogController.put)
    .post(bodyParser.json(), BlogController.post)
    .delete(BlogController.remove);


  app.use('/blog', blog);
  blog.use('/admin', blogAdmin);

  return blog;
};
