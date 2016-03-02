'use strict';

const debug = require('debug');
const log = debug('nodejs-sandbox:asyncModule');

//asyncModule.js
var asyncModule = {};
asyncModule.initialized = false;


asyncModule.initialize = function (callback) {
    log('initialize');
    setTimeout(function () {
        asyncModule.initialized = true;
        callback();
    }, 1000);
};

asyncModule.tellMeSomething = function (callback) {
    process.nextTick(function () {
        if (!asyncModule.initialized) {
            return callback(
                new Error('I don\'t have anything to say right now')
            );
        }
        callback(null, 'Current time is: ' + new Date());
    });
};

module.exports = asyncModule;