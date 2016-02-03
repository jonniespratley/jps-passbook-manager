'use strict';

const multipart = require('connect-multiparty');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const assert = require('assert');
const _ = require('lodash');


module.exports = function(program) {
	const config = program.config.defaults;
	const logger = program.getLogger('AppController');
  let AppController = {};

	AppController.index = function(req, res, next){
		res.status(200).json({
			message: config.name
		});
	};

	/**
	 * I handle displaying an upload form.
	 * @param req
	 * @param res
	 * @param next
     */
	AppController.get_upload = function(req, res, next){
		res.writeHead(200, {
			'content-type': 'text/html'
		});
		res.end(
			'<form action="" enctype="multipart/form-data" method="post">' +
			'<input type="file" name="files" multiple="multiple"><br>' +
				//		'<input type="file" name="file"><br>' +
			'<input type="submit" value="Upload">' +
			'</form>'
		);
	};

	/**
	 * I handle processing a file upload.
	 * @param req
	 * @param res
	 * @param next
     */
	AppController.post_upload = function(req, res, next){
		var out = [];
		var files = [];
		var file = null;
		var toFilename;

			logger('upload', req.files);

			// parse a file upload
			files = req.files;
			for (var f in files) {
				file = files[f];
				logger('upload', 'file', file);
				toFilename = path.resolve(config.dataPath, './passes/' + req.body._id + '.raw/' + file.originalFilename);

				try {
					//	fs.writeFileSync(toFilename, fs.readFileSync(file.path));
					fs.copySync(file.path, toFilename);
					out.push(toFilename);
					logger('upload', 'to', toFilename);
					fs.removeSync(file.path);

				} catch (err) {
					console.error('Oh no, there was an error: ' + err.message);
					res.status(400).json({
						error: err.message
					});
				}


			}
			res.status(200).json(out);


	};

	AppController.post_log = function(req, res, next){
		var dataLog = {};
		dataLog._id = _.uniqueId('log-');
		dataLog.docType = 'log';
		dataLog.data = req.body;
		dataLog.created_at = _.now();

		_.defer(function() {
			program.db.put(dataLog).then(function(resp) {
				res.status(200).json(resp);
			}).catch(function(err) {
				res.status(400).json(err);
			});
		}, 250);
	};

  return AppController;

};
