var path = require('path');
var _ = require('lodash');
var assert = require('assert');
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var config = program.config.defaults;
var Users = require(path.resolve(__dirname, '../../lib/models/users.js'))(program.db);
var Device = program.require('models/device');
var User = program.require('models/user');
var u;
var d;

var docTypes = [];
describe('Passes', function() {

	it('should return only passes', function(done) {
		program.models.Passes.getPasses().then(function(resp) {
			docTypes = _.pluck(resp, '_key');
			console.log('docTypes', docTypes);
			done();
		});
	});
});

describe('Users', function() {
	it('be defined', function() {
		assert(Users);
	});

	it('findOrCreate(profile, done) - should find/create user', function(done) {
		assert.ok(Users.findOrCreate);
		Users.findOrCreate({
			username: 'jonniespratley'
		}, function(err, resp) {
			if (err) {
				assert.fail(err);
			}
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
