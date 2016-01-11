'use strict';

const _ = require('lodash');
const utils = require('../utils');
const request = require('request');

module.exports = function(options) {
  const BASE_URL = 'http://localhost:5984/passbookmanager';
  var defaultOptions = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-token': 'my-token'
    },
    baseUrl: BASE_URL
  };
  var baseRequest = request.defaults(defaultOptions);

  var sendRequest = function(options) {

    options = _.assign(defaultOptions, options, {
      url: `${BASE_URL}/${options.url}`
    });

    console.log('sendRequest', options);

    return new Promise(function(resolve, reject) {
      baseRequest(options, function(err, resp, body) {
        if (!options.json) {
          try {
            resp.data = JSON.parse(resp.body);
          } catch (e) {
            console.error('Couldnt parse json', e);
          } finally {

          }
        }
        console.log('response', body);
        if (err) {
          reject(err);
        }
        resolve(resp);
      });
    });
  }

  var api = {
    get: function(id) {
      return new Promise(function(resolve, reject) {
        sendRequest({
          url: `/${id}`
        }).then(resolve, reject);
      });
    },
    remove: function(id) {
      return new Promise(function(resolve, reject) {
        sendRequest({
          url: `/${id}`,
          method: 'DELETE'
        }).then(resolve, reject);
      });
    },
    put: function(doc) {
      return new Promise(function(resolve, reject) {
        sendRequest({
          url: `/${doc._id}`,
          method: 'PUT',
          json: true,
          body: doc

        }).then(resolve, reject);
      });
    },
    post: function(doc) {
      doc._id = require('node-uuid').v4();
      return new Promise(function(resolve, reject) {
        sendRequest({
          url: `/${doc._id}`,
          method: 'POST',
          json: true,
          body: doc

        }).then(resolve, reject);
      });
    },
    find: function(params) {
      return new Promise(function(resolve, reject) {

      });
    },
    allDocs: function(params) {
      return new Promise(function(resolve, reject) {

      });
    }
  };

  return api;
};
