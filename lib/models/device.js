'use strict';


module.exports = function(_, assert) {
	function Device(o){
		assert(o.deviceLibraryIdentifier, 'has device id');
		if (!o.deviceLibraryIdentifier) {
			throw new Error('Must provide deviceLibraryIdentifier');
		}

		let id = 'device-' + o.deviceLibraryIdentifier;
		_.assign(this, {
			_id: id,
			pushToken: o.pushToken,
			deviceLibraryIdentifier: o.deviceLibraryIdentifier,
			docType: 'device',
			created_at: _.now(),
			updated_at: _.now(),
			type: 'device'
		}, o);
		return this;
	}

	return Device;
};
