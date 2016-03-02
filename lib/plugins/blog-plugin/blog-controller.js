'use strict';
const _ = require('lodash');

module.exports = function (Logger, BlogService) {
	var log = Logger.getLogger('blog-controller');

	var Model = function (o) {
		return _.defaults({
			id: null,
			title: 'Test'
		}, o);
	};
	var BlogController = {};

	BlogController.index = function (req, res, next) {
		log('index', req.body);
		res.render('index');
	};

	BlogController.renderPosts = function (req, res, next) {
		log('posts', req.url);
		res.render('posts');
	};

	BlogController.renderPost = function (req, res, next) {
		log('post', req.url);
		BlogService.get(req.params.id, function (err, result) {
			if (err) {
				res.status(404).send(err);
			}
			log('found post', result);
			res.locals.post = result;
			res.render('post', {post: result});
		});

	};

	BlogController.get = function (req, res, next) {
		BlogService.get(req.params.id, function (err, result) {
			if (err) {
				res.status(404).send(err);
			}
			log('found post', result);
			res.locals.post = result;
			res.status(200).send(result);
		});
	};

	BlogController.put = function (req, res, next) {
		log('put', req.params.id, req.body);
		var m = new Model(req.body);
		if (req.params.id) {
			m.id = req.params.id;
		}
		BlogService.put(m, function (err, result) {
			if (err) {
				res.status(404).json(err);
			}
			res.status(200).json({
				ok: true,
				data: req.body
			});
		});
	};

	BlogController.post = function (req, res, next) {
		log('post', req.params.id, req.body);
		var m = new Model(req.body);
		if (req.params.id) {
			m.id = req.params.id;
		}
		BlogService.post(m, function (err, result) {
			if (err) {
				res.status(404).json(err);
			}
			res.status(201).json({
				ok: true,
				data: req.body
			});
		});
	};

	BlogController.remove = function (req, res, next) {
		log('remove', req.params.id);
		BlogService.remove(req.params.id, function (err, result) {
			if (err) {
				res.status(404).json(err);
			}
			res.status(200).json(result);
		});
	};


	return BlogController;

};
