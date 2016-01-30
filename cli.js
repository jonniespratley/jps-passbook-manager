#!/usr/bin/env node

'use strict';
var assert = require('assert');
var fs = require('fs-extra');
var _ = require('lodash');
var path = require('path');
var request = require("request");
var SignPass = require(path.resolve(__dirname, './lib/SignPass.js'));
var program = require(path.resolve(__dirname, './lib/program.js'))();
var logger = program.utils.getLogger('cli');
var vorpal = require('vorpal')();
var utils = program.utils;
var cli = vorpal;

/*
TODO - Commands
=======================================================

Here is a list of things that are always done with
this app.

0. System
  a. build
  b. test
  c. clean
  d. release
  e. export

1. Passes
  a. list
  b. delete
  c. create (defaults)
  d. export (.raw)
  e. sign (.pkpass)

2. devices
  a. list
  b. delete

3. logs
  a. list
  b. delete

4. users
  a. list
  b. delete
  c. create

=======================================================
*/
var tree = require('cli-tree');
var Table = require('cli-table');

function createTable(data) {
  var table = new Table({
    //  head: _(data).first().keys()
  });
  if (data && data.length) {
    data.forEach(function(row) {
      table.push(row);
    });
  }
  return table.toString();
}



var CREATE_PASS_QUESTIONS = [{
  type: "list",
  name: "type",
  message: "What type of pass? ",
  choices: SignPass.passTypes
}, {
  type: 'input',
  name: 'logoText',
  message: 'Logo Text: ',
  default: function() {
    return 'JPS';
  }
}, {
  type: 'input',
  name: 'organizationName',
  message: 'Organization: ',
  default: function() {
    return 'Passbook Manager';
  }
}, {
  type: 'input',
  name: 'description',
  message: 'Description: ',
  default: function() {
    return 'This is the default pass description.';
  }
}];



// TODO: Commands

cli.command('passes <action>')
  .option('-l, --list', 'List all passes.')
  .option('-e, --export', 'Export all passes. (.raw)')
  .option('-s, --sign', 'Sign all passes. (.pkpass)')
  .option('-v, --verbose', 'Print foobar instead.')
  .description('Various actions to manage passes.')
  .action(function(args, callback) {
    var self = this;
    tree(args.options);

    return new Promise(function(resolve, reject) {
      switch (args.action) {


        case 'list':
          self.log('Getting passes');
          program.models.Passes.getPasses().then(function(resp) {
            self.log(createTable(resp));
            resolve(resp);
          }, reject);
          break;
        case 'export':
          self.log('Export passes');
          resolve();
          break;

        case 'create':
          self.prompt(CREATE_PASS_QUESTIONS, function(answers) {
            self.log('Create github pass for', answers);
            resolve(answers);
          });
          break;

        default:

          break;
      }


    });


  });


// TODO: Devices
cli.command('devices')
  //.option('-c, --cert [cert]', 'The path to output the .pems')
  .description('All devices')
  .action(function(args, callback) {
    let self = this;
    return new Promise(function(resolve, reject) {
      program.db.find({
        docType: 'device'
      }).then(function(resp) {
        self.log(createTable(resp));
        resolve(resp);
      }, reject);
    });
  });

// TODO: Logs
cli.command('logs')
  //.option('-c, --cert [cert]', 'The path to output the .pems')
  .description('All logs')
  .action(function(args, callback) {
    let self = this;
    return new Promise(function(resolve, reject) {
      program.db.find({
        docType: 'log'
      }).then(function(resp) {
        self.log(createTable(resp));
        resolve(resp);
      }, reject);
    });
  });


// TODO: Pems command
cli
  .command('create-pems <cert>')
  .option('-i, --identifier <identifier>', 'Pass type identifier for the certificate')
  .option('-p, --passphrase <passphrase>', 'Passphrase for the certificate')
  .description('Utility to create a cert and key .pem from a .p12')
  .action(function(args, callback) {
    var self = this;
    var cert_url = args.cert;
    var cert_pass = args.options.passphrase;
    var cert_id = args.options.identifier;

    if (cert_url && cert_pass) {
      SignPass.createPems(cert_id, cert_url, cert_pass, function(err, resp) {
        callback(null, resp);
        self.log(resp);
      });
    } else {
      callback('Must provide path to .p12 and passhrase');
    }
  });


// TODO: Sign pass command.
cli.command('sign-pass')
  .option('-o, --output [output]', 'The path to output the .pkpass')
  .description('Utility to sign .raw into .pkpass')
  .action(function(args, callback) {
    var self = this;
    var output_url = args.output;

    callback('Please select a pass!');
  });


// TODO: Pass Type IDs
cli.command('pass-type-ids')
  .option('-c, --cert [cert]', 'The path to output the .pems')
  .description('Utility to store certs and passphrases')
  .action(function(args, callback) {
    var self = this;

    callback('Pass type ids');
  });



cli
  .delimiter(program.pkg.config.delimiter + '$')
  .show();
