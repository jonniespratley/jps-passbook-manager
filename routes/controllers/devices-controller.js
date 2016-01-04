'use strict';
/*
 # Registration
 # register a device to receive push notifications for a pass
 #
 # POST /v1/devices/<deviceID>/registrations/<typeID>/<serial#>
 # Header: Authorization: ApplePass <authenticationToken>
 # JSON payload: { "pushToken" : <push token, which the server needs to send push notifications to this device> }
 #
 # Params definition
 # :device_id      - the device's identifier
 # :pass_type_id   - the bundle identifier for a class of passes, sometimes refered to as the pass topic, e.g. pass.com.apple.backtoschoolgift, registered with WWDR
 # :serial_number  - the pass' serial number
 # :pushToken      - the value needed for Apple Push Notification service
 #
 # server action: if the authentication token is correct, associate the given push token and device identifier with this pass
 # server response:
 # --> if registration succeeded: 201
 # --> if this serial number was already registered for this device: 304
 # --> if not authorized: 401

 post '/v1/devices/:device_id/registrations/:pass_type_id/:serial_number'










 # Updatable passes
 #
 # get all serial #s associated with a device for passes that need an update
 # Optionally with a query limiter to scope the last update since
 #
 # GET /v1/devices/<deviceID>/registrations/<typeID>
 # GET /v1/devices/<deviceID>/registrations/<typeID>?passesUpdatedSince=<tag>
 #
 # server action: figure out which passes associated with this device have been modified since the supplied tag (if no tag provided, all associated serial #s)
 # server response:
 # --> if there are matching passes: 200, with JSON payload: { "lastUpdated" : <new tag>, "serialNumbers" : [ <array of serial #s> ] }
 # --> if there are no matching passes: 204
 # --> if unknown device identifier: 404
 #
 #






 # Unregister
 #
 # unregister a device to receive push notifications for a pass
 #
 # DELETE /v1/devices/<deviceID>/registrations/<passTypeID>/<serial#>
 # Header: Authorization: ApplePass <authenticationToken>
 #
 # server action: if the authentication token is correct, disassociate the device from this pass
 # server response:
 # --> if disassociation succeeded: 200
 # --> if not authorized: 401
 */
module.exports = function(program) {
	var logger = program.getLogger('devices-controller');
	return {
		/*
		 # Registration
		 # register a device to receive push notifications for a pass
		 #
		 # POST /v1/devices/<deviceID>/registrations/<typeID>/<serial#>
		 # Header: Authorization: ApplePass <authenticationToken>
		 # JSON payload: { "pushToken" : <push token, which the server needs to send push notifications to this device> }
		 #
		 # Params definition
		 # :device_id      - the device's identifier
		 # :pass_type_id   - the bundle identifier for a class of passes, sometimes refered to as the pass topic, e.g. pass.com.apple.backtoschoolgift, registered with WWDR
		 # :serial_number  - the pass' serial number
		 # :pushToken      - the value needed for Apple Push Notification service
		 #
		 # server action: if the authentication token is correct, associate the given push token and device identifier with this pass
		 # server response:
		 # --> if registration succeeded: 201
		 # --> if this serial number was already registered for this device: 304
		 # --> if not authorized: 401

		 post '/v1/devices/:device_id/registrations/:pass_type_id/:serial_number'
		 */
		post_device_registration: function(req, res, next) {
			logger('Handling registration request...');
			let device_id = req.params.device_id;
			let pass_type_id = req.params.pass_type_id;
			let serial_number = req.params.serial_number;
			let push_token = req.body.pushToken;
			let authentication_token = req.get('Authorization');

			logger('Registration request', `device_id = ${device_id}, pass_type_id = ${pass_type_id}`);

			if (!authentication_token) {
				res.status(401).json({
					error: 'Unauthorized'
				});
			} else {
				// # Validate that the device has not previously registered
				//# Note: this is done with a composite key that is combination of the device_id and the pass serial_number
				let uuid = device_id + '-' + serial_number;
				let registration = {
					_id: uuid,
					deviceLibraryIdentifier: device_id,
					passTypeIdentifier: pass_type_id,
					authorization: authentication_token,
					pushToken: push_token,
					serialNumber: serial_number
				};

				//# The device has already registered for updates on this pass
				program.db.get(registration._id).then(function(pass) {

					//Acknowledge the request with a 200 OK response
					res.status(200).json(pass);
				}).catch(function(err) {
					// No registration found, lets add the device
					logger('Registration not found - inserting');
					program.db.put(registration).then(function(resp) {
						res.status(201).json(resp);
					});
				});
			}
		},
		/**
		 * # Unregister
		 #
		 # unregister a device to receive push notifications for a pass
		 #
		 # DELETE /v1/devices/<deviceID>/registrations/<passTypeID>/<serial#>
		 # Header: Authorization: ApplePass <authenticationToken>
		 #
		 # server action: if the authentication token is correct, disassociate the device from this pass
		 # server response:
		 # --> if disassociation succeeded: 200
		 # --> if not authorized: 401
		 * @param req
		 * @param res
		 * @param next
		 */
		delete_device_registration: function(req, res, next) {
			logger('Remove device');
			let authentication_token = req.get('Authorization');
			let device_id = req.params.device_id;
			let pass_type_id = req.params.pass_type_id;
			let serial_number = req.params.serial_number;
			let uuid = device_id + '-' + serial_number;

			if (!authentication_token) {
				res.status(401).json({
					error: 'Unauthorized'
				});
			} else {

				logger('Finding pass for device');
				//Pass and authentication token match.

				program.db.get(uuid).then(function(pass) {
					logger('found pass', pass);
					
					if (pass.authenticationToken === authentication_token) {
						logger('Pass and authentication token match.');
						program.db.remove(uuid).then(function(resp) {
							res.status(200).json(resp);
						});
					} else {
						res.status(401).json({
							error: 'Pass and authentication do not token match.'
						});
					}
				}).catch(function(err) {
					res.status(401).json({
						error: 'Registration does not exist'
					});
				});
			}
		},
		get_device_passes: function(req, res, next) {
			let authentication_token = req.get('Authorization');
			let device_id = req.params.device_id;
			let pass_type_id = req.params.pass_type_id;
			let serial_number = req.params.serial_number;
			logger('get_device_passes');
				if (!authentication_token) {
				res.status(401).json({
					error: 'Unauthorized'
				});
			} else {
					res.status(200).json({
					serialNumbers: ['']
				});
			}
		}
	};
};
