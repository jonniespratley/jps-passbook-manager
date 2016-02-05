'use strict';
const argsList = require('args-list');
const debug = require('debug');
const path = require('path');
let dependencies = {};
let factories = {};

let getLogger = function(name) {

	const pkg = require(path.resolve(__dirname, '../package.json'));
	return debug(pkg.name + ':' + name);
};
const log = getLogger('DIContainer');


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
	constructor(name) {
		log('constructor', name);
	}

	/**
	 * Register a factory module
	 * @param name
	 * @param factory
	 */
	factory(name, factory) {
		log('factory', name);
		factories[name] = factory;
	}

	/**
	 * Register a controller
	 * @param name
	 * @param factory
	 */
	controller(name, factory) {
		this.factory(name, factory);
	}

	/**
	 * Register a model
	 * @param name
	 * @param factory
	 */
	model(name, factory) {
		this.factory(name, factory);
	}
	service(name, factory) {
		this.factory(name, factory);
	}

	/**
	 * Register a dependency
	 * @param name
	 * @param dep
	 */
	register(name, dep) {
		log('register =>', name);
		dependencies[name] = dep;
	}

	value(key, val) {
		log('value');
		return this.register(key, val);
	}

	/**
	 * Get registered module/value
	 * @param name
	 * @returns {*}
	 */
	get(name) {
		let _this = this,
			factory;
		log('get', name);

		if (!dependencies[name]) {
			log('found', name);
			factory = factories[name];
			dependencies[name] = factory && _this.inject(factory);

			if (!dependencies[name]) {
				log('error', `Cannot find dependency: ${name}`);
				throw new Error(`Cannot find dependency: ${name}`);
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

		var args = argsList(factory).map(function(dependency) {
			log('inject =>', dependency);
			return _this.get(dependency);
		});
		log('injector', args);
		if (factory) {
			log('factory.apply', args.length, 'dependencies');
			return factory.apply(null, args);
		} else {
			throw new Error(`Cannot inject dependency: ${factory}`);
		}
	}
}

DIContainer.module = function(name) {
	log('module', name);
	return new DIContainer(name);
};

module.exports = DIContainer;
