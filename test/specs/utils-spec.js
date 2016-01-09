'use strict';
const assert = require('assert');
const path = require('path');
const utils = require(path.resolve(__dirname, '../../lib/utils'));

describe('Utils', function (done) {
	it('should be defined', function (done) {
		assert(utils);
		done();
	});
	it('should create Github Pass', function (done) {
		utils.githubToPass('jonniespratley', function (err, user) {
			assert(user);
			done();
		});
	});
	it('checksum() - should create a checksum hash', function (done) {
		var hash1 = utils.checksum('This is my test text');
		var hash1_expected = 'e53815e8c095e270c6560be1bb76a65d';
		var hash2_expected = 'cd5855be428295a3cc1793d6e80ce47562d23def';
		var hash2 = utils.checksum('This is my test text', 'sha1');

		assert(hash1 === hash1_expected);
		assert(hash2 === hash2_expected);
		done();
	});
});
