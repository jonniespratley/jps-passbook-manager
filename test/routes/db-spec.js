/**
 * Created by jps on 12/17/15.
 */
var assert = require('assert'),
	path = require('path'),
	fs = require('fs-extra'),
	os = require('os');


//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');
var config = fs.readJsonSync(path.resolve(__dirname, '../../config/config.json'));


// TODO: Program
//var program = require(path.resolve(__dirname, '../../lib/program.js'))(config);
var Database = require(path.resolve(__dirname, '../../lib/db.js'));
var db = new Database(config);

describe('db', function () {
	it('should be defined', function () {
		assert(db);
		console.log(db);
	})
	it('should create doc', function (done) {
		db.post({
			title: 'test'
		}).then(function (resp) {
			assert(resp);
			done();
		})
	})

});
