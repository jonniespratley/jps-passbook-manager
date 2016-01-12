var assert = require('assert'),
	path = require('path'),
	fs = require('fs-extra'),
	os = require('os'),
	Passbook = require(path.resolve(__dirname, '../../lib/jps-passbook'));

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var config = program.config.defaults;
var jpsPassbook = new Passbook(program);

var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;
var testPass = mockPass;
var testPassfile = '';
var rawPassFolder = '';
var testPassDir = path.resolve(__dirname, '../../.tmp/');

var passFiles = [];



describe('jps-passbook', function() {
	it('createPass() - should create each pass type', function(done) {
		this.timeout(5000);
		var len = mocks.mockPasses.length;
		mocks.mockPasses.forEach(function(pass) {
			jpsPassbook.createPass(pass, true, function(data) {
				//	console.log('pass created', data);
				passFiles.push(data);
				assert.ok(data._id);
				len--;
			});
		});
		done();

	});

	it('createPass() - should create a pass .raw and sign into a .pkpass', function(done) {
		console.log(passFiles);
		jpsPassbook.createPass(mockPass, true, function(err, p) {
			//assert(fs.existsSync(p.rawFilename));
			assert.ok(p);
			done();
		});
	});

	it('signPass() - should sign .raw package into a .pkpass', function(done) {
		this.timeout(5000);
		jpsPassbook.signPass(mockPass, '-p', function(err, p) {
			assert.ok(p, 'returns pass location');
			//	assert(fs.existsSync(p));
			done();
		});
	});

	it('validatePass() - should validate a pass', function(done) {
		jpsPassbook.validatePass(mockPass, function(err, pass) {
			assert.ok(pass, 'returns pass');
			done();
		});
	});
});
