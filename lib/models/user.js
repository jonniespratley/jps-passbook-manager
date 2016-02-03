'use strict';
module.exports = function(_, assert) {

function User(o){
	//assert(o.username, 'has username');
	assert(o.email, 'has email');
	o = o || {};

	let id = 'user-' + (o.email);

	id = id.replace(/\W/g, '-');
	let emailRegex = /@[\w\-][\w\-\.]+[a-zA-Z]{1,4}/gi;
	if (o.email) {
		o.username = o.email.replace(emailRegex, '');
	}

	let methods = {};

	methods.generateHash = function(password) {
		return password;
	};

	methods.validatePassword = function(password) {
		return true;
	};

	methods.checkPassword = function(p1, p2) {
		return true;
	};

	let profile = {
		_id: id,
		id: id,
		provider: 'local',
		displayName: null,
		username: null,
		password: null,
		name: {
			familyName: null,
			givenName: null,
			middleName: null
		},
		emails: [{
			value: null,
			type: null
		}],
		photos: [],
		passTypeIdentifiers: [],
		data: {},
		docType: 'user',
		created_at: _.now(),
		updated_at: _.now()
	};

	if (o._json) {
		profile.data = o._json;
		delete o._json;
	}

	if (o._raw) {
		delete o._raw;
	}
		return _.assign(profile, o, methods)
	}

	return User;
};
