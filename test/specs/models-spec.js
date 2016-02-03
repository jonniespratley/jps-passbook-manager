const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;

var docTypes = [];

xdescribe('Passes', function() {
	it('should return only passes', function(done) {
		program.models.Passes.getPasses().then(function(resp) {
			docTypes = _.pluck(resp, '_key');
			console.log('docTypes', docTypes);
			done();
		});
	});
});
