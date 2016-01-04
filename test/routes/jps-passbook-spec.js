var assert = require('assert'),
	path = require('path'),
	fs = require('fs-utils'),
	os = require('os'),
	jpsPassbook = require(path.resolve(__dirname, '../../lib/jps-passbook')),
	testPassName = 'Test_Pass_';

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;
var testPass = mockPass;
var testPassfile = '';
var rawPassFolder = '';
var testPassDir = path.resolve(__dirname, '../../.tmp/');

	var passFiles = [];
describe('jps-passbook', function() {
	
	beforeEach(function(done) {
		//fs.mkdir(testPassDir);
		done();
	});
	
	afterEach(function(done) {
		//fs.del(testPassDir);
		done();
	});

	it('should create each pass type', function(done){
		mocks.mockPasses.forEach(function(pass){
			console.log('Create pass', pass);
			jpsPassbook.createPass(pass).then(function(data) {
				passFiles.push(data);
			});
		});
		assert.ok(passFiles.length === 4);
		done();
	});

	xit('should create a pass file with .raw appended', function(done) {
		jpsPassbook.createPass(mockPass).then(function(data) {
			mockPass = data;
			rawPassFolder = data.filename;
			assert.equal(data.filename, testPassDir + path.sep + testPass.description + '.raw');
			testPassDir = data.directory;
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});


	it('should export a pass', function(done) {
		jpsPassbook.exportPass(mockPass.filename, mockPass).then(function(pass) {
			assert.ok(pass, 'returns pass location');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});


	xit('should sign a pass.raw into a .pkpass', function(done) {
		jpsPassbook.signPass(mockPass.filename).then(function(pass) {
			assert.ok(pass, 'returns pass location');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	xit('should validate a pass', function(done) {
		jpsPassbook.validatePass(mockPass.filename).then(function(pass) {
			assert.ok(pass, 'returns pass');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});
});
