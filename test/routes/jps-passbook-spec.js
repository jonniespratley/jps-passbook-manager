var assert = require('assert'), path = require('path'), fs = require('fs-utils');
var os = require('os');
var jpsPassbook = require(path.resolve(__dirname, '../../routes/jps-passbook'));
var testPassName = 'Test_Pass_';

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;
var testPass = mockPass;
var testPassfile = '';
var rawPassFolder = '';
var testPassDir = path.resolve(__dirname, '../../.tmp/' + mockPass._id);
describe('jps-passbook', function () {
	beforeEach(function (done) {
		//fs.mkdir(testPassDir);
		done();
	});
	afterEach(function (done) {
		//fs.del(testPassDir);
		done();
	});

	it('should create a pass file with .raw appended', function (done) {
		mockPass.description = testPassName;
		jpsPassbook.createPass(testPassDir, mockPass).then(function (data) {
			console.log('new pass', data);
			console.log('new pass', data.filename);

			mockPass = data;
			rawPassFolder = data.filename;
			assert.equal(data.filename, testPassDir + path.sep + testPass.description + '.raw');
			testPassDir = data.directory;

			done();
		}).catch(function (err) {
			assert.fail(err);
			done();
		});
	});

	it('should export a pass', function (done) {
		jpsPassbook.exportPass(mockPass.filename, mockPass).then(function (pass) {
			assert.ok(pass, 'returns pass location');
			console.log('export', pass);
			done();
		}).catch(function (err) {
			assert.fail(err);
			done();
		});
	});

	it('should sign a pass', function (done) {
		jpsPassbook.signPass(mockPass.filename).then(function (pass) {
			assert.ok(pass, 'returns pass location');
			console.log('signed', pass);
			done();
		}).catch(function (err) {
			assert.fail(err);
			done();
		});
	});
	it('should validate a pass', function (done) {
		jpsPassbook.validatePass(mockPass.filename).then(function (pass) {
			assert.ok(pass, 'returns pass');
			console.log('valid response', pass);
			done();
		}).catch(function (err) {
			assert.fail(err);
			done();
		});
	});
});
