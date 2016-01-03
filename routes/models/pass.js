'use strict';
const _ = require('lodash');

module.exports = function(obj) {
  var uuid = require('node-uuid').v4();
  return _.defaults({
    _id: "pass-" + uuid,
    docType: "pass",
    type: "Coupon",
    lastUpdated: new Date().toString(),
    formatVersion: 1,
    "passTypeIdentifier": "pass.passbookmanager.io",
    serialNumber: uuid,
    "teamIdentifier": "USE9YUYDFH",
    "webServiceURL": "",
    "authenticationToken": "12345",
    "barcode": {
      "message": "123456789",
      "format": "PKBarcodeFormatQR",
      "messageEncoding": "iso-8859-1"
    },
    "locations": [{
      "longitude": -122.00,
      "latitude": 37.00
    }],
    "organizationName": "JPS Coupon",
    "logoText": "JPS",
    "description": "20% off any products",
    "foregroundColor": "#000000",
    "backgroundColor": "#ffffff",
    "coupon": {
      "primaryFields": [{
        "key": "offer",
        "label": "Any premium dog food",
        "value": "20% off"
      }],
      "auxiliaryFields": [{
        "key": "expires",
        "label": "EXPIRES",
        "value": "2 weeks"
      }],
      "backFields": [{
        "key": "terms",
        "label": "TERMS AND CONDITIONS",
        "value": "."
      }]
    }
  }, obj);
};