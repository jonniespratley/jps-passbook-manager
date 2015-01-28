'use strict';

var assert = require('assert'),
		path = require('path'),
		fs = require('fs-utils'),
		express = require('express'),
		request = require('supertest');
var require_helper = require('../../require_helper');
var config = require_helper('test/test-config');

var testId = null, testSerial = null;
var RestResource = require_helper( 'routes/rest-resource');
var rest = new RestResource(config);

describe('rest-resource', function(){



	it('findAll(col) - should return array of objects', function(done){
		rest.findAll('passes').then(function(data){
			testId = data[0]._id;
			testSerial = data[0].serialNumber;
			assert.ok((data instanceof Array), 'is array');
			done();
		});
	});

	it('findAll(col, id) - should return object', function(done){
		rest.findAll('passes', testId).then(function(data){
			assert.ok((data instanceof Object), 'is object');
			done();
		});
	});

	it('findById(col, id) - should return object', function(done){
		rest.findById('passes', testId).then(function(data){
			assert.ok(data.serialNumber === testSerial, 'returns correct object');
			done();
		}, function(err){
			console.log(err);
			assert.fail();
		});
	});

	it('destroy(col, obj) - should remove object', function(done){
		rest.destroy('passes', {_id: testId}).then(function(data){
			assert.ok(data, 'returns correct object');
			done();
		}, function(err){
			console.log(err);
			assert.fail();
		});
	});

	it('getCollections() - should return object', function(done){
		rest.getCollections('').then(function(data){
			assert.ok(data.length > 0, 'returns array');
			done();
		}, function(err){
			assert.fail();
		});
	});


	it('getCollectionStatus(name) - should return object', function(done){
		rest.getCollectionStatus('passes').then(function(data){
			assert.ok(data.name === 'passes', 'returns correct object');
			done();
		}, function(err){
			assert.fail();
		});
	});


});
