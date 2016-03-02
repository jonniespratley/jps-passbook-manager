'use strict';
const debug = require('debug');
const level = require('level');
const sublevel = require('level-sublevel');
const Logger = require('../logger')('db-plugin');

module.exports = function (dbName) {
    var log = Logger.getLogger(dbName);

    var db = sublevel(
        level(dbName, {
            valueEncoding: 'json'
        })
    );


    db.createReadStream()
        .on('data', function (data) {

            log('stream', 'data', `${data.key} = ${data.value}`);
        })
        .on('error', function (err) {
            log('stream', 'error', err);
        })
        .on('close', function () {
            log('stream', 'close');
        })
        .on('end', function () {
            log('stream', 'end');
        });

    return db;
};
