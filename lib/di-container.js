'use strict';

const argsList = require('args-list');
const utils = require('./utils');

let dependencies = {};
let factories = {};
let log = utils.getLogger('DIContainer');

/**
 * @class DIContainer
 * @description This class handles auto loading module dependencies as a DI container.
 * Modules must be registered before used.
 * @example
 *
 var diContainer = new DIContainer();
 diContainer.register('config', {name: 'value');

 var MyDb = function (config) {
	class MyDb {
		constructor(c) {
			console.warn('You injected', c);
		}

		find(id) {
			console.warn('Find by', id);
		}
	}
	return new MyDb(config);
}

diContainer.factory('MyDb', MyDb);
var db = diContainer.get('MyDb');
assert(db.find);
 */
class DIContainer {
	constructor() {
		log('constructor');
	}

	/**
	 * Register a factory module
	 * @param name
	 * @param factory
	 */
	factory(name, factory) {
		log('register factory', name);
		factories[name] = factory;
	}

	/**
	 * Register a controller
	 * @param name
	 * @param factory
     */
	controller(name, factory) {
		log('register controller', name);
		factories[name] = factory;
	}

	/**
	 * Register a model
	 * @param name
	 * @param factory
     */
	model(name, factory) {
		log('register model', name);
		factories[name] = factory;
	}

	/**
	 * Register a dependency
	 * @param name
	 * @param dep
	 */
	register(name, dep) {
		log('register', name);
		dependencies[name] = dep;
	}

	/**
	 * Get registered module/value
	 * @param name
	 * @returns {*}
	 */
	get(name) {
		log('get', name);
		var _this = this;
		if (!dependencies[name]) {
			var factory = factories[name];
			dependencies[name] = factory && _this.inject(factory);
			if (!dependencies[name]) {
				throw new Error('Cannot find: ' + name);
			}
		}
		return dependencies[name];
	}

	/**
	 * Inject arguments
	 * @param factory - The factory module
	 * @returns {*}
	 */
	inject(factory) {
		var _this = this;
		var args = argsList(factory).map(function (dependency) {
			return _this.get(dependency);
		});

		if (!factory) {
			throw new Error('Cannot find:', factory);
		}

		log('inject', args.length, 'dependencies');
		return factory.apply(null, args);
	}
}

module.exports = DIContainer;
