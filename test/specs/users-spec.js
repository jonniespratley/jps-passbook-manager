'use strict';
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const Users = program.require('models/users')(program.db);;

var u;
var testUserId = null;
describe('Users Model', function() {
  after(function(done){
    program.db.remove(testUserId).then(function(resp){
      done();
    });
  });

  it('be defined', function() {
    assert(Users);
  });


  it('find(profile, done) - should find user unsuccessfully', function(done) {
    assert.ok(Users.find);
    Users.find({
      username: 'jonnie'
    }, function(err, resp) {
      if (err) {
        assert(err);
        done();
      }
      assert.fail(resp);
      done();
    });
  });

  it('findOrCreate(profile, done) - should find/create user successfully', function(done) {
    assert.ok(Users.findOrCreate);
    Users.findOrCreate({
      username: 'jonniespratley'
    }, function(err, resp) {
      if (err) {
        assert.fail(err);
        done();
      }
      assert(resp);
      done();
    });
  });

  it('find(profile, done) - should find user successfully', function(done) {
    assert.ok(Users.find);
    Users.find({
      username: 'jonniespratley'
    }, function(err, resp) {
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
    Users.findOrCreate({
      username: 'test'
    }, function(err, resp) {
      if (err) {
        assert.fail(err);
        done();
      }
      testUserId = resp._id;
      assert(resp);
      done();
    });
  });


});
