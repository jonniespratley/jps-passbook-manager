'use strict';
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const Device = program.get('Device');

var d;

describe('Device Model', function() {
	before(function() {
		d = new Device({
      pushToken: '0123456789876543210',
    	deviceLibraryIdentifier: '0123456789876543210',
    	serialNumber: '0123456789876543210',
    	passTypeIdentifier: mocks.mockIdentifer.passTypeIdentifier
		});
	});

	it('should be defined', function(done) {
		assert(Device);
		done();
	});

});
