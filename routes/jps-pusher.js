var path = require('path');
var fs = require('fs');
var apns = require('apn');

/**
 * Custom php -> node methods
 */

var php = {
	dirname : function(f, ext) {
		return path.dirname(f);
	},
	file_exists : function(f) {
		return fs.existsSync(f);
	},
	file_get_contents : function(f) {
		return fs.readFileSync(f, 'utf8');
	},
	realpath : function(path) {
		return fs.realpathSync(path);
	},
	json_encode : function(obj) {
		return JSON.stringify(obj);
	},
	json_decode : function(s) {
		return JSON.parse(s);
	}
};

module.exports = function(config) {

	/**
	 * Pusher - I am the pusher object that handles sending a push notification to a iOS device.
	 * @file /WWW/AppMatrixEngine/ame-angular/routes/api/pusher.js
	 * @object
	 */
	var Pusher = {
		options : {
			cert : 'cert.pem',
			certData : null, 
			key : 'key.pem', 
			keyData : null, 
			passphrase : 'fred', 
			ca : './files/Aps/entrust_ssl_ca.cer', 
			pfx : null, 
			pfxData : null,
			gateway : 'gateway.sandbox.push.apple.com', 
			port : 2195, 
			rejectUnauthorized : true, 
			enhanced : true, 
			errorCallback : onError, 
			cacheLength : 100, 
			autoAdjustCache : true, /* Whether the cache should grow in response to messages being lost after errors. */
			connectionTimeout : 0 /* The duration the socket should stay alive with no activity in milliseconds. 0 = Disabled. */
		},
		devices : ['54563ea0fa550571c6ea228880c8c2c1e65914aa67489c38592838b8bfafba2a', 'd46ba7d730f8536209e589a3abe205b055d66d8a52642fd566ee454d0363d3f3'],
		apnsConnection : null,
		init : function(options) {
			this.apnsConnection = new apns.Connection(Pusher.options);
		},
		feedback : {},
		initFeedback : function(appid) {
			var options = {
				cert : './files/Aps/' + appid + '_cert.p12', /* Certificate file */
				certData : null, /* Certificate file contents (String|Buffer) */
				key : './files/Aps/' + appid + '_key.p12', /* Key file */
				keyData : null, /* Key file contents (String|Buffer) */
				passphrase : 'fred', /* A passphrase for the Key file */
				ca : './files/Aps/entrust_ssl_ca.cer', /* Certificate authority data to pass to the TLS connection */
				pfx : null, /* File path for private key, certificate and CA certs in PFX or PKCS12 format. If supplied will be used instead of certificate and key above */
				pfxData : null, /* PFX or PKCS12 format data containing the private key, certificate and CA certs. If supplied will be used instead of loading from disk. */
				// address: 'feedback.push.apple.com', /* feedback address */
				address : 'feedback.push.apple.com',
				port : 2196, /* feedback port */
				feedback : this.feedbackHandler, /* enable feedback service, set to callback */
				batchFeedback : true, /* if feedback should be called once per connection. */
				interval : 60,
				error : function(e) {
					console.log('************'.error, e);
				}
			};
			var feedback = new apns.Feedback(options);
			this.feedback = feedback;

			console.log('--------------Feedback Service--------------', feedback);
		},
		feedbackHandler : function(time, buffer) {
			console.log('-----------feedback handler--------------', time, buffer);
		},
		/**
		 * I send a push notification to the device passed.
		 * @param {Object} live
		 * @param {Object} pem
		 * @param {Object} token
		 * @param {Object} alert
		 * @param {Object} badge
		 * @param {Object} sound
		 * @param {Object} cb
		 */
		sendPush : function(live, pem, token, alert, badge, sound, cb) {

			//Check if the pem exists
			console.log('-------------APS-PEM', pemCheck);
			console.log('------------APS-Notifications', note);
			console.log('------------APS-Sent', sent);
			console.log('-------------Token', token);
			console.log('-------------Pem', pem);

			//Set the file location for the pem
			Pusher.options.cert = './files/Aps/' + pem + '_cert.pem';
			Pusher.options.key = './files/Aps/' + pem + '_key.pem';

			var pemCheck = php.file_exists(php.realpath(Pusher.options.cert));

			//if the app is live, change the gateway
			if (live === 'true') {

				Pusher.options.gateway = 'gateway.push.apple.com';
			}

			//create a new aps connect
			Pusher.apnsConnection = new apns.Connection(Pusher.options);

			//start the feedback service
			//this.initFeedback(pem);

			//create a new device
			var myDevice = new apns.Device(token);

			//create a new notification
			var note = new apns.Notification();
			note.expiry = Math.floor(Date.now() / 1000) + 3600;
			note.alert = alert;
			note.device = myDevice;
			note.badge = badge;
			note.sound = sound;

			//send the notifications
			var sent = Pusher.apnsConnection.sendNotification(note);

			//trigger the callback
			if (cb) {
				cb(note);
			}

		}
	};

};
