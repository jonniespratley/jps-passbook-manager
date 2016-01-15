var path = require('path');
var assert = require('assert');

var Device = require(path.resolve(__dirname, '../../lib/models/device.js'));

var d;
describe('Device', function(done) {
	it('should throw error if no deviceLibraryIdentifier', function() {
		assert.throws(function() {
			d = new Device();
		}, Error);
	});
});

var u;
var User = require(path.resolve(__dirname, '../../lib/models/user.js'));
describe('User Model', function() {
	before(function() {
		u = new User({
			id: 'test',
			displayName: 'jonnie',
			_json: {
				name: 'test'
			},
			_raw: ''
		});
	});

	it('should be defined', function(done) {
		assert(User);
		done();
	});

	it('should create instance', function(done) {
		assert(u);
		assert(u.displayName === 'jonnie');
		done();
	});

	it('should not have _json', function(done) {
		assert(u);
		assert(!u._json);
		assert(u.data);
		done();
	});

	it('should not have _raw', function(done) {
		assert(u);
		assert(!u._raw);
		done();
	});

});
