'use strict';
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const Users = program.require('models/users')(program.db);;
const User = program.require('models/user');
var u;
var testUserId = null;

var testUser = {
	username: 'test',
	email: 'test@gmail.com',
	password: 'test'
};

var testUser1 = {
	email: 'test1@gmail.com',
	password: 'test'
};
var testUser2 = {
	email: 'test2@gmail.com',
	password: 'test'
};
var testUser3 = {
	email: 'test3@gmail.com',
	password: 'test'
};

describe('Users Model', function() {

  after(function(done) {
    program.db.remove(testUserId).then(function(resp) {
      console.log('Removed', resp);
      done();
    }).catch(function(err) {
      done();
    });
  });

  it('be defined', function() {
    assert(Users);
  });

	it('create(user, done) - should create a user', function (done) {
		Users.create(testUser, function(err, resp){
			if (err) {
				assert.fail(err);
				done();
			}
			assert(resp);
			done();
		});
	});

	it('getUsers() - should fetch users and resolve promise on success', function (done) {
		Users.getUsers().then(function(resp){
			console.log('GOT USERS', resp);
			assert(resp);
			done();
		}).catch(function(err){
			assert.fail(err);
			done();
		});
	});

	it('save(user, done) - should create a user', function (done) {
		Users.save(testUser1, function(err, resp){
			if (err) {
				assert.fail(err);
				done();
			}
			assert(resp);
			done();
		});
	});

	it('findOrCreate(profile, done) - should find/create user successfully', function(done) {
		assert.ok(Users.findOrCreate);
		Users.findOrCreate(testUser2, function(err, resp) {
			if (err) {
				assert.fail(err);
				done();
			}
			assert(resp);
			done();
		});
	});

  it('findOrCreate(profile, done) - should find/create user successfully', function(done) {
    Users.findOrCreate(testUser3, function(err, resp) {
      if (err) {
        assert.fail(err);
      }
      testUserId = resp._id;
      assert(resp);
      done();
    });
  });

  it('find(profile, done) - should find user unsuccessfully', function(done) {
    assert.ok(Users.find);
    Users.find({
      username: 'unknown'
    }, function(err, resp) {
      if (err) {
        assert(err, 'returns error');
        done();
      }
      assert.fail(resp);
      done();
    });
  });

	it('validate(user, done) - find valid user by username/password', function (done) {
		Users.validate(testUser3, function(err, resp){
			if (err) {
				assert.fail(err);
				done();
			}
			assert(resp);
			done();
		});
	});

	it('findByUsername(profile, done) - should find user successfully', function(done) {
		assert.ok(Users.findByUsername);
		Users.findByUsername('test3', function(err, resp) {
			if (err) {
				assert.fail(err);
			}
			assert(resp);
			done();
		});
	});



});
