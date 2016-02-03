'use strict';
module.exports = function(_, assert, db, utils, BaseController, Pass, Passes, jpsPassbook) {
	var logger = utils.getLogger('controller:passes');

	class PassesController extends BaseController{
		constructor(name, options){
			super(name, options);
		}
		get_pass(req, res){
			var id = req.params.id
			logger('get_pass', id);
			db.get(id).then(function(resp) {
				res.status(200).json(resp);
			}).catch(function(err) {
				res.status(204).json(err);
			});
		}
		get_passes(req, res){
			var self = this;
			var auth = req.get('Authorization');
			var pass_type_id = req.params.pass_type_id;
			var device_id = req.params.device_id;
			var serial_number = req.params.serial_number;
			var lastUpdated = req.query.updatedSince;
			logger('Handling pass delivery request...');
			logger('Authorization=', auth);
			logger('pass_type_id=', pass_type_id);
			logger('serial_number=', serial_number);
			logger('device_id=', device_id);

			if (!auth) {
				logger('get_passes:unauthorized');
				return res.status(401).json({
					error: 'Unauthorized'
				});

			} else {
				Passes.find({
					passTypeIdentifier: pass_type_id,
					serialNumber: serial_number
				}).then(function(resp) {
					logger('get_passes:success');
					if (lastUpdated > resp.lastUpdated) {
						res.status(204).json({});
					} else {
						res.status(200).json(resp);
					}

				}).catch(function(err) {
					logger('get_passes:error', err);
					res.status(404).json(err);
				});
			}
		}
		delete_pass(req, res){
			var id = req.params.id;
			logger('delete_pass', id);
			Passes.remove(id).then(function(resp) {
				res.status(200).json(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		}
		sign_pass(req, res){
			var id = req.params.id
			logger('sign_pass', id);
			Passes.get(id).then(function(resp) {
				jpsPassbook.createPass(mockPass, function(err, p) {
					//	res.status(200).json(p);
					res.set('Content-Type', 'application/vnd.apple.pkpass')
						.status(200)
						.download(p.pkpassFilename);
				});
				//	res.status(200).json(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		}
		put_pass(req, res){
			var p = new Pass(req.body);
			var id = req.params.id
			p._id = id;
			logger('put_pass', id);
			Passes.save(p).then(function(resp) {
				logger('save', resp);
				res.status(200).json(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		}
		post_pass(req, res){
			var p = new Pass(req.body);
			logger('post_pass', p._id);
			Passes.save(p).then(function(resp) {
				res.status(201).json(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		}
		get_all_passes(req, res) {
			Passes.getPasses(req.params).then(function(resp) {
				res.status(200).json(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		}
		get_find_pass(req, res) {
			var params = req.query;
			logger('get_find_pass', params);
			Passes.find(params).then(function(resp) {
				res.status(200).json(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		}
	}



	return new PassesController();
};
