'use strict';
/**
 * Created by jps on 12/17/15.
 */
var assert = require('assert'),
	nock = require('nock'),
	path = require('path');


var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;

var config = program.config.defaults;
var CouchDB = require(path.resolve(__dirname, '../../lib/adapters/db-couchdb.js'));

var testDoc = {
	_id: 'test-doc',

	name: 'test'
};


var scope = nock(config.baseUrl)

	//get
	.get(`/${testDoc._id}`)
	.query(true)
	.reply(200, testDoc)

	//put
	.put(`/${testDoc._id}`)
	.query(true)
	.reply(200, testDoc)

	//remove
	.delete(`/${testDoc._id}`)
	.query(true)
	.reply(200, testDoc)

	//post
	.post(`/${testDoc._id}`)
	.reply(201, testDoc)

	//post
	.post(`/_bulk_docs`)
	.reply(201, {ok: 1})

	//put - fail
	.put('/test-fail')
	.reply(404, {})

	.get('/_all_docs')
	.query(true)
	.reply(200, {rows: [
		{doc: testDoc}
	]})
	;


describe('couchdb', function() {
	var db = new CouchDB(config);

	var mockDevice = mocks.mockDevice;
	var mockPass = mocks.mockPass;

	it('should be defined', function(done) {
		assert(db);
		done();
	});

	it('should have allDocs, get, remove, put methods', function(done) {
		assert(db.allDocs);
		assert(db.remove);
		assert(db.put);
		assert(db.get);
		assert(db.find, 'has find');
		assert(db.post, 'has post');
		assert(db.saveAll, 'has saveall');
		done();
	});

	it('should create file with id', function(done) {
		db.put(testDoc).then(function(resp) {
			testDoc._rev = 1;
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('should reject create file with used id', function(done) {
		db.put({
			_id: 'test-fail'
		}).then(function(resp) {
			assert.fail(resp);
			done();
		}).catch(function(err) {
			assert.ok(err);
			done();
		});
	});

	xit('should create file with generated', function(done) {
		db.post({
			name: 'test2'
		}).then(function(resp) {
			assert(resp.id, 'returns id');
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	xit('should get file with id', function(done) {
		db.get(testDoc._id).then(function(resp) {
			assert(resp);
			assert(resp.name === testDoc.name, 'returns object');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('should find object', function(done) {
		db.find({
			name: testDoc.name
		}).then(function(resp) {
			console.log('find res[', resp);
			assert(resp.name === testDoc.name, 'returns object');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	xit('should remove file with id', function(done) {
		db.remove(testDoc._id, testDoc._rev).then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	xit('should save array of docs', function(done) {
		db.saveAll([
			mockDevice,
			mockPass
		]).then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	xit('should return array of docs', function(done) {
		db.allDocs().then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	xit('should find item by params', function(done) {
		db.find({
			serialNumber: mockPass.serialNumber
		}).then(function(resp) {
			//assert(resp[0].serialNumber === mockPass.serialNumber, 'returns object');
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});



});
