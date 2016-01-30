var path = require('path');
var assert = require('assert');
var program = require(path.resolve(__dirname, '../../lib/program.js'))();
var config = program.config.defaults;

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));

var Users = require(path.resolve(__dirname, '../../lib/models/users.js'))(program.db);
var Device = require(path.resolve(__dirname, '../../lib/models/device.js'));

var d;

describe('Users', function() {
	it('be defined', function() {
		assert(Users);
	});

	it('findOrCreate(profile, done) - should find/create user', function(done) {
		assert.ok(Users.findOrCreate);
		Users.findOrCreate({
			username: 'jonniespratley'
		}, function(err, resp) {
			assert(resp);
			done();
		})
	});

	it('find(profile, done) - should find user', function(done) {
		assert.ok(Users.find);
		Users.find({
			username: 'jonniespratley'
		}, function(err, resp) {
			assert(resp);
			done();
		});
	});
});

xdescribe('Device', function() {
	it('should throw error if no deviceLibraryIdentifier', function() {
		assert.throws(function() {
			d = new Device();
		}, Error);
		``
	});
});

var u;
var User = require(path.resolve(__dirname, '../../lib/models/user.js'));
describe('User Model', function() {
	before(function() {
		u = new User({

			username: 'jonnie',
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
