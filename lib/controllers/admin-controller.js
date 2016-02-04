'use strict';

const fs = require('fs-extra');

module.exports = function(path, _, Logger, jpsPassbook, SignPass, program) {

	const logger = Logger.getLogger('AdminController');
	let AdminController = function() {

		/**
		 * I handle saving a upload to the file system and data store.
		 * @param file
		 * @returns {*}
		 */
		function saveUpload(file) {
			return new Promise(function(resolve, reject) {
				let toFilename = path.resolve(program.config.defaults.dataPath, './uploads/' + file.originalFilename);
				let _doc = {
					_id: 'file-' + file.name,
					originalFilename: file.originalFilename,
					path: toFilename,
					size: file.size,
					name: file.name,
					type: file.type
				};
				logger('saveUpload', _doc);
				fs.copy(file.path, _doc.path, function(err) {
					if (err) {
						reject(err);
					}
					db.put(_doc).then(resolve, reject);
				});
			});
		}
		this.saveUpload = saveUpload;

		/**
		 * I handle getting a pass type identifier
		 * @param req
		 * @param res
		 */
		this.get_passTypeIdentifier = function(req, res) {
			jpsPassbook.getPassTypeIdentifierPromise(req.params.id).then(function(resp) {
				console.log('found identifier', resp);
				if (resp) {
					res.status(200).json(resp);
				} else {
					res.status(404).json(err);
				}
			}).catch(function(err) {
				res.status(404).json(err);
			});
		};


		/**
		 * I handle saving a passTypeIdentifier
		 * @param req
		 * @param res
		 */
		this.post_passTypeIdentifier = function(req, res) {
			logger('post_passTypeIdentifier', req.body, req.files);
			let out = {};
			let _id = req.params.id;
			let passTypeIdentifier = req.body;
			passTypeIdentifier.passTypeIdentifier = _id;

			if (req.files && req.files.file) {
				logger('Upload file', req.files);

				saveUpload(req.files.file).then(function(_file) {
					logger('Save file', _file);

					passTypeIdentifier.p12 = _file.path;

					jpsPassbook.savePassTypeIdentifier(passTypeIdentifier, function(err, resp) {
						if (err) {
							logger('savePassTypeIdentifier - error', err);
							res.status(400).json(err);
						} else {
							res.status(201).json(resp);
						}
					});

				}).catch(function(err) {
					logger('saveUpload - error', err);
					res.status(400).json(err);
				});

			} else {
				res.status(400).json({
					error: 'Please upload a .p12 file!'
				});
			}
		};

		/**
		 * I handle downloading a pass
		 * @param req
		 * @param res
		 */
		this.get_downloadPass = function(req, res) {
			let id = req.params.id;
			logger('get_downloadPass', id);
			if (id) {
				db.get(id).then(function(resp) {
					logger('found pass', resp._id);
					logger('found pkpassFilename', resp.pkpassFilename);
					res.set('Content-Type', 'application/vnd.apple.pkpass')
						.status(200)
						.download(resp.pkpassFilename);
				}).catch(function(err) {
					res.status(404).json(err);
				});
			} else {
				res.status(400).json('Must provide id!');
			}
		};

		/**
		 * I handle getting a pass
		 * @param req
		 * @param res
		 */
		this.get_signPass = function(req, res) {
			let id = req.params.id
			logger('get_signPass', id);
			db.get(id).then(function(resp) {
				jpsPassbook.createPassPromise(resp).then(function(p) {
					jpsPassbook.signPassPromise(p).then(function(_resp) {
						res.status(200).json(_resp);
					}).catch(function(err) {
						res.status(404).json(err);
					});
				}).catch(function(err) {
					logger('get_signPass - error', err);
					res.status(400).json(err);
				});
			}).catch(function(err) {
				res.status(404).json(err);
			});
		};

		/**
		 * I handle finding data
		 * @param req
		 * @param res
		 */
		this.get_find = function(req, res) {
			logger('get_find', req.query);
			db.find(req.query).then(function(resp) {
				logger('get_find', 'resp', resp);
				if (resp) {
					res.status(200).json(resp);
				} else {
					res.status(404).json(err);
				}

			}).catch(function(err) {
				res.status(404).json(err);
			});
		};
	};



	return AdminController;


};
