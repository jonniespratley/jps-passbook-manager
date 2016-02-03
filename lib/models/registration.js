'use strict';
module.exports = function(_){

  function Registration(obj) {
    let device_id = obj.device_id;
    let pass_id = obj.pass_id || 'pass-' + obj.serial_number;
    let id = `registration-${device_id}`;

    return _.assign({
      _id: id,
      docType: 'registration',
      device_id: device_id,
      pass_id: pass_id,
      auth_token: null,
      push_token: null,
      created_at: _.now(),
      updated_at: _.now()
    }, obj);
  }
  
  return Registration;
};
