'use strict';

const assert = require('assert');
const path = require('path');


//var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const DIContainer = require(path.resolve(__dirname, '../../lib/di-container'));
//var program = mocks.program;
//var config = program.get('config');

var testConfig = {
	username: 'test',
	password: 'test',
	host: 'localhost'
};

var container = null;

const ApiFactory = function (config) {
	class LocalApi {
		constructor(c) {
			console.warn('You injected', c);
		}

		post(obj) {
			console.warn('post', obj);
		}
		get(obj) {
			console.warn('get', obj);
		}
	}
	return new LocalApi(config);
};

const DbService = function (config, someModule) {
	class LocalStore {
		constructor(c) {
			console.warn('You injected', c);
		}
		put(obj){
			console.warn('put', obj);
		}
		allDocs(o){
			console.warn('allDocs', o);
		}
		remove(obj){
			console.warn('save', obj);
		}
		get(id) {
			console.warn('Find by', id);
		}
	}
	return new LocalStore(config);
};


describe('DIContainer', function () {
	before(function () {
		container = DIContainer.module('testApp');
		container.register('config', testConfig);
	});

	it('should create instance', function (done) {
		assert(container instanceof DIContainer);
		done();
	});

	it('register/value(name, value) - should register module by name', function (done) {
		assert(container.value);
		container.value('someModule', {name: 'value'});
		done();
	});

	it('get(name) - should return registered module by name', function (done) {
		assert(container.get);
		assert(container.get('someModule').name === 'value');
		done();
	});

	it('factory(name, obj) - should register module by name', function (done) {
		assert(container.factory);
		container.factory('Api', ApiFactory);
		done();
	});

	it('get(factory) - should return instance of factory', function (done) {
		assert(container.get('Api').post);
		done();
	});

	it('service(name, prototype) - should register service constructor by name', function (done) {
		assert(container.service);
		container.factory('Db', DbService);
		done();
	});

	it('get(service) - should return new instance of service', function (done) {
		assert(container.get('Db').get);
		done();
	});


});
