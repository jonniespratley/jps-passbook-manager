var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	user: Object,
  title:  String,
  formatVersion: Number,
  type:   String,
  serialNumber:   String,
  passTypeIdentifier:   String,
  webServiceURL:   String,
  teamIdentifier:   String,
  authenticationToken:   String,
  organizationName:   String,
  description:   String,
  logoText:   String,
  foregroundColor:   String,
  backgroundColor:   String,
  storeCard: Object,
  generic: Object,
  coupon: Object,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pass', schema);