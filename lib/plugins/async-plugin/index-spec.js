'use strict';
const assert = require('assert');
const asyncModule = require('./');


describe('async-plugin', function () {

    it('should be defined', function () {
        assert(asyncModule);
    });

    it('should create instance', function (done) {
        this.timeout(5000);
        asyncModule.initialize(  function () {
            console.log('asyncModule.js initialized');
            done();
        });
    });


});
