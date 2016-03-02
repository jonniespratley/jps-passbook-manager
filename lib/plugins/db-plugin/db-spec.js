'use strict';
const assert = require('assert');
const DB = require('./');
var db = null;

describe('db-plugin', function () {

    before(function () {
        db = DB('./test-db').sublevel('users');
    });
    after(function () {
        db.close();
    });

    it('should be defined', function () {
        assert(DB);
    });

    it('should create instance', function () {
        assert(db);
    });

    it('put() - should do put', function (done) {
        db.put('name', 'LevelUP', function (err) {
            if (err) {
                console.log('Ooops!', err);
                assert.fail(err);
                done();
            }
            done();
        });
    });

    it('createValueStream() - should get stream', function (done) {
        db.createValueStream().on('data', function (data) {
            assert(data);
            console.log('value=', data);
        });

        db.put('user-jonnie', 'jonnie', function (err) {
            done();
        });

    });

    it('get() - should get key value', function (done) {
        db.get('name', function (err, value) {

            assert(value);
            done();
        });
    });

    it('del() - should remove key value', function (done) {
        db.del('name', function (err, value) {

            assert(true);
            done();
        });
    });

    it('batch() - should do batch operation', function (done) {
        var ops = [
            {type: 'put', key: 'name', value: 'Yuri Irsenovich Kim'},
            {type: 'put', key: 'dob', value: '16 February 1941'},
            {type: 'put', key: 'spouse', value: 'Kim Young-sook'},
            {type: 'put', key: 'occupation', value: 'Clown'}
        ];

        db.batch(ops, function (err) {
            if (err) {
                assert.fail(err);
                done();
            }
            assert(true);
            done();
        });
    });
});
