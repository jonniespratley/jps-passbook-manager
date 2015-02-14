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

var testPass = {
	"type": "eventTicket",
	"formatVersion": 1,
	"passTypeIdentifier": "pass.jsapps.io",
	"serialNumber": "123456",
	"teamIdentifier": "USE9YUYDFH",
	"webServiceURL": "https://example.com/passes/",
	"authenticationToken": "vxwxd7J8AlNNFPS8k0a0FfUFtq0ewzFdc",
	"relevantDate": "2011-12-08T13:00-08:00",
	"locations": [
		{
			"longitude": -122.3748889,
			"latitude": 37.6189722
		}
	],
	"barcode": {
		"message": "123456789",
		"format": "PKBarcodeFormatPDF417",
		"messageEncoding": "iso-8859-1"
	},
	"organizationName": "Apple Inc.",
	"description": "The Beat Goes On",
	"foregroundColor": "rgb(255, 255, 255)",
	"backgroundColor": "rgb(60, 65, 76)",
	"eventTicket": {
		"primaryFields": [
			{
				"key": "event",
				"label": "EVENT",
				"value": "The Beat Goes On"
			}
		],
		"secondaryFields": [
			{
				"key": "loc",
				"label": "LOCATION",
				"value": "Moscone West"
			}
		],
		"backFields": [
			{
				"key": "terms",
				"label": "TERMS AND CONDITIONS",
				"value": "Generico offers this pass, including all information, software, products and services available from this pass or offered as part of or in conjunction with this pass (the \"pass\"), to you, the user, conditioned upon your acceptance of all of the terms, conditions, policies and notices stated here. Generico reserves the right to make changes to these Terms and Conditions immediately by posting the changed Terms and Conditions in this location.\n\nUse the pass at your own risk. This pass is provided to you \"as is,\" without warranty of any kind either express or implied. Neither Generico nor its employees, agents, third-party information providers, merchants, licnsors or the like warrant that the pass or its operation will be accurate, reliable, uninterrupted or error-free. No agent or representative has the authority to create any warranty regarding the pass on behalf of Generico. Generico reserves the right to change or discontinue at any time any aspect or feature of the pass."
			}
		]
	},
	"updated": "20:25:38 GMT-0800 (PST)"
};
describe('rest-resource', function(){

	it('should create a object', function (done) {
		rest.create('passes', testPass).then(function(data){
			assert.ok(data, 'returns response');
			done();
		});
	});

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
		rest.findBy('passes', {_id: testId}).then(function(data){
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
