//asyncModuleWrapper.js
'use strict';
const asyncModule = require('./asyncModule');
var asyncModuleWrapper = {};
var activeState, pending = [], initializedState, notInitializedState;

/**
 * Initialized module
 * @type {asyncModule|exports|module.exports}
 */
initializedState = asyncModule;

/**
 * Not initialized module
 * @type {{initialize: notInitializedState.initialize, tellMeSomething: notInitializedState.tellMeSomething}}
 */
notInitializedState = {
    /**
     * Initialize the async module
     * @param callback
     */
    initialize: function (callback) {
        asyncModule.initialize(function () {
            asyncModuleWrapper.initalized = true;
            activeState = initializedState;

            pending.forEach(function (req) {
                asyncModule[req.method].apply(null, req.args);
            });
            pending = [];

            callback();
        });
    },
    /**
     * Method example
     * @param callback
     * @returns {Number}
     */
    tellMeSomething: function (callback) {
        return pending.push({
            method: 'tellMeSomething',
            args: arguments
        });
    }
};
/**
 * Active module state
 * @type {{initialize: notInitializedState.initialize, tellMeSomething: notInitializedState.tellMeSomething}}
 */
activeState = notInitializedState;

/**
 *
 * @type {boolean}
 */
asyncModuleWrapper.initialized = false;

/**
 *
 * @returns {*}
 */
asyncModuleWrapper.initialize = function () {
    return activeState.initialize.apply(activeState, arguments);
};

/**
 *
 * @type {{}}
 */
module.exports = asyncModuleWrapper;

