'use strict';

module.exports = function(options) {

  /*
  const apn = require('apn');
  const utils = require('./utils');

  var logger = utils.getLogger('pusher');

    var defaults = {
      "production": false,
      cert: '../certificates/passbookmanager-apns-cert.pem',
      //certData: null,
      key: '../certificates/passbookmanager-apns-key.p12',
      //keyData: null,
      passphrase: 'fred',
      ca: '../certificates/AppleWWDRCA.cer',
      //pfx: null,

      //pfxData: null,

      gateway: 'gateway.push.apple.com',
      //gateway: 'gateway.sandbox.push.apple.com',

      port: 2195,

      rejectUnauthorized: true,

      enhanced: true,
      //errorCallback: onError,

      cacheLength: 100,

      autoAdjustCache: true,

      connectionTimeout: 0
    };
    var token = '8701addcd7c847b07776c95883b79243527c5b959b12f81658d74fe2c1938fd';
    var apnConnection = new apn.Connection(options);
    var myDevice = new apn.Device(token);

    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.payload = {};

    apnConnection.pushNotification(note, myDevice);

    */
};
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
