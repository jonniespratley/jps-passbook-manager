'use strict';
const assert = require('assert');
const path = require('path');
const utils = require(path.resolve(__dirname, '../../lib/utils'));


var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var config = program.config.defaults;
var Passbook = require(path.resolve(__dirname, '../../lib/jps-passbook'))
var jpsPassbook = new Passbook(program);

describe('Utils', function(done) {
	it('should be defined', function(done) {
		assert(utils);
		done();
	});

	it('should return Github Pass', function(done) {
		this.slow(5000);
		utils.githubToPass('jonniespratley', function(err, user) {
			assert(user);
			done();
		});
	});

	it('should create Github Pass', function(done) {

		const GITHUB_USERS = [
			//'sindresorhus',
			//'eddiemonge',
			//'addyosmani',
			'jonniespratley'
		];

		GITHUB_USERS.forEach(function(n) {
			utils.githubToPass(n, function(err, user) {
				assert(user, 'has user');
				user.serialNumber = '123456789';
				jpsPassbook.createPass(user, function(err, resp) {
					assert(resp, 'has pass');
					done();
				});
			});

		});

	});

	it('checksum() - should create a checksum hash', function(done) {
		var hash1 = utils.checksum('This is my test text');
		var hash1_expected = 'e53815e8c095e270c6560be1bb76a65d';
		var hash2_expected = 'cd5855be428295a3cc1793d6e80ce47562d23def';
		var hash2 = utils.checksum('This is my test text', 'sha1');

		assert(hash1 === hash1_expected);
		assert(hash2 === hash2_expected);
		done();
	});
});
