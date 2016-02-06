'use strict';
const multipart = require('connect-multiparty');
const bodyParser = require('body-parser');

module.exports = function(path, fs, _, config, db, Logger, BaseController) {
	const logger = Logger.getLogger('AppController');

  class AppController extends BaseController{
		constructor(options){
			super('AppController', options);
		}

		index(req, res, next){
			res.status(200).json({
				message: config.name
			});
		}
		get_upload(req, res, next){
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
		}

			/**
			 * I handle processing a file upload.
			 * @param req
			 * @param res
			 * @param next
		     */
			post_upload(req, res, next){
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
			}
			post_log(req, res, next){
				var dataLog = {};
				dataLog._id = _.uniqueId('log-');
				dataLog.docType = 'log';
				dataLog.data = req.body;
				dataLog.created_at = _.now();

				_.defer(function() {
					db.put(dataLog).then(function(resp) {
						res.status(200).json(resp);
					}).catch(function(err) {
						res.status(400).json(err);
					});
				}, 250);
			}
	}

  return new AppController();
};
