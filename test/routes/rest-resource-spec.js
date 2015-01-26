'use strict';

var assert = require('assert'),
		path = require('path'),
		fs = require('fs-utils'),
		express = require('express'),
		request = require('supertest');

//mongodb://admin:admin@ds031611.mongolab.com:31611/passbookmanager
var config = {
	name: 'passbookmanager',
	message: 'Passbook Manager API Server',
	version: 'v1',
	security: {
		salt: 'a58e325c6df628d07a18b673a3420986'
	},
	server: {
		host: 'localhost',
		port: 4141
	},
	db: {
		username: 'demouser',
		password: 'demopassword',
		host: 'ds031611.mongolab.com',
		port: 31611,
		url : 'mongodb://localhost:27017/passbookmanager'
	},
	collections: ['devices', 'passes', 'notifications', 'settings'],
	staticDir: './app',
	publicDir: __dirname + path.sep + 'www/public',
	uploadsTmpDir: __dirname + path.sep + '.tmp',
	uploadsDestDir: __dirname + path.sep + 'www/public'
};

var RestResource = require(path.resolve(__dirname, '../../routes/rest-resource'));
var rest = new RestResource(config);

var testId = null, testSerial = null;


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
