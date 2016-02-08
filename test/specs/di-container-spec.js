'use strict';
const assert = require('assert');
const path = require('path');

const DIContainer = require(path.resolve(__dirname, '../../lib/di-container'));
//var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
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
			console.warn('LocalApi.constructor', c);
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
			console.warn('LocalStore.constructor', c);
		}

		put(obj) {
			console.warn('put', obj);
		}

		allDocs(o) {
			console.warn('allDocs', o);
		}

		remove(obj) {
			console.warn('save', obj);
		}

		get(id) {
			console.warn('Find by', id);
		}
	}
	return new LocalStore(config);
	//return LocalStore;
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

	it('register(name, value) - should register module by name', function (done) {
		assert(container.register);
		container.register('someModule', {name: 'value'});
		done();
	});

	it('factory(name, obj) - should register module by name', function (done) {
		assert(container.factory);
		container.factory('Api', ApiFactory);
		done();
	});

	it('service(name, prototype) - should register service by name', function (done) {
		assert(container.service);
		container.service('Db', new DbService());
		done();
	});

	it('get(name) - should return registered module by name', function (done) {
		assert(container.get);
		assert(container.get('someModule').name === 'value');
		done();
	});

	it('get(factory) - should return instance of factory', function (done) {
		assert(container.get('Api').post);
		done();
	});

	it('get(name) - should return new instance of service', function (done) {
		assert(container.get('Db').get);
		done();
	});

	it('get(name) - should throw error if service does not exist', function (done) {
		assert.throws(function () {
			container.get('MyApi');
		}, Error);
		done();
	});

	it('inject(service) - inject dependencies into service', function (done) {
		assert(container.inject(DbService));
		done();
	});

	it('modules - should contain Map of dependencies', function (done) {
		assert(container.modules);
		assert(container.modules.get);
		assert(container.modules.set);
		assert(container.modules.has);
		assert(container.modules.keys);
		assert(container.modules.values);
		assert(container.modules instanceof Map);
		done();
	});

	it('modules.has() - should return true if module exists', function (done) {
		assert(container.modules.has('Api') === true);
		assert(container.modules.has('Unknown') === false);
		done();
	});

	it('modules.keys() - should return all module keys', function (done) {
		var keys = container.modules.keys();
		console.log(keys);
		assert(keys);
		done();
	});

});
