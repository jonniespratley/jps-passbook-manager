'use strict';
const apn = require('apn');
const utils = require('./utils');
var logger = utils.getLogger('pusher');

var options = {
  "production": false,
  cert: '../certificates/passbookmanager-apns-cert.pem',
  //certData: null,
  key: '../certificates/passbookmanager-apns-key.p12',
  //keyData: null,
  passphrase: 'fred',
  ca: '../certificates/AppleWWDRCA.cer',
  //pfx: null,
  /* File path for private key, certificate and CA certs in PFX or PKCS12 format. If supplied will be used instead of certificate and key above */
  //pfxData: null,
  /* PFX or PKCS12 format data containing the private key, certificate and CA certs. If supplied will be used instead of loading from disk. */
  gateway: 'gateway.push.apple.com',
  //gateway: 'gateway.sandbox.push.apple.com',
  /* gateway address */
  port: 2195,
  /* gateway port */
  rejectUnauthorized: true,
  /* Value of rejectUnauthorized property to be passed through to tls.connect() */
  enhanced: true,
  /* enable enhanced format */
  //errorCallback: onError,
  /* Callback when error occurs function(err,notification) */
  cacheLength: 100,
  /* Number of notifications to cache for error purposes */
  autoAdjustCache: true,
  /* Whether the cache should grow in response to messages being lost after errors. */
  connectionTimeout: 0 /* The duration the socket should stay alive with no activity in milliseconds. 0 = Disabled. */
};
var token = '8701addcd7c847b07776c95883b79243527c5b959b12f81658d74fe2c1938fd';
var apnConnection = new apn.Connection(options);
var myDevice = new apn.Device(token);

var note = new apn.Notification();
note.expiry = Math.floor(Date.now() / 1000) + 3600;
note.payload = {};

apnConnection.pushNotification(note, myDevice);
/*
var options = {
  "batchFeedback": true,
  "interval": 300
};

var feedback = new apn.Feedback(options);
feedback.on("feedback", function(devices) {
  devices.forEach(function(item) {
    logger('feedback', item);
    // Do something with item.device and item.time;
  });
});
*/
