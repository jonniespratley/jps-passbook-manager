'use strict';
const _ = require('lodash');

function Registration(obj) {
  let device_id = obj.device_id;
  let pass_id = obj.pass_id;
  let id = `registration-${device_id}-${pass_id}`;

  _.assign(this, {
    _id: id,
    docType: 'registration',
    device_id: device_id,
    pass_id: pass_id,
    created_at: _.now(),
    updated_at: _.now()
  });


  return this;
}

module.exports = Registration;
