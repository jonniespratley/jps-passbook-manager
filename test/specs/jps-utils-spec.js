'use strict';
const assert = require('assert');
const _ = require('lodash');
const path = require('path');

const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const utils = program.get('utils');

const jpsPassbook = program.get('jpsPassbook');

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
		const GITHUB_USERS = [ /*'sindresorhus', 'eddiemonge', 'addyosmani', */ 'jonniespratley'];
		var _done = _.after(GITHUB_USERS.length, function() {
			done();
		});
		_.forEach(GITHUB_USERS, function(n) {
			utils.githubToPass(n, function(err, res) {
				assert(res.pass, 'has pass');
				assert(res.user, 'has user');
				jpsPassbook.createPass(res.pass, function(err, resp) {
					assert(resp, 'has response');
					_done();
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
