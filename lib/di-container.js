'use strict';
const argsList = require('args-list');
const debug = require('debug');
const path = require('path');
let dependencies = {};
let factories = {};

let getLogger = function (name) {

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
	 * factory() is used to associate a component name against a factory.
	 * @param name
	 * @param factory
	 */
	factory(name, factory) {
		log('factory', name);
		factories[name] = factory;
		return this;
	}

	/**
	 * register() is used to associate a component name directly with an instance.
	 * @param name
	 * @param dep
	 */
	register(name, dep) {
		log('register =>', name);
		dependencies[name] = dep;
		return this;
	}

	controller(name, factory) {
		return this.factory(name, factory);
	}

	model(name, factory) {
		return this.factory(name, factory);
	}

	service(name, factory) {
		return this.register(name, factory);
	}

	value(key, val) {
		log('value');
		return this.register(key, val);
	}

	/**
	 * get() retrieves a component by its name.
	 * If an instance is already available, it simply returns it; otherwise, it tries to invoke the registered factory to obtain a new instance.
	 * It is very important to observe that the module factories are invoked by injecting the current instance of the service locator (serviceLocator).
	 * This is the core mechanism of the pattern that allows the dependency graph for our system to be built automatically and on-demand. We will see how this works in a moment.
	 * @param name
	 * @returns {*}
	 */
	get(name) {
		let self = this;
		let factory;

		log('get', name);
		if (!dependencies[name]) {
			log('found', name);
			factory = factories[name];
			dependencies[name] = factory && self.inject(factory);

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
		var self = this;

		var args = argsList(factory).map(function (dependency) {
			log('inject =>', dependency);
			return self.get(dependency);
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

DIContainer.module = function (name) {
	log('module', name);
	return new DIContainer(name);
};

module.exports = DIContainer;
