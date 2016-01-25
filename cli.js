'use strict';
var assert = require('assert');
var fs = require('fs-extra');
var _ = require('lodash');
var path = require('path');
var request = require("request");
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



cli
  .command('passes [optionalArg]')
  .option('-l, --list', 'List all passes.')
  .option('-e, --export', 'Export all passes. (.raw)')
  .option('-s, --sign', 'Sign all passes. (.pkpass)')
  .option('-v, --verbose', 'Print foobar instead.')
  .description('Various actions to manage passes.')
  .action(function(args, callback) {
    tree(args.options);
    callback();
  });



// TODO: Certs command
cli
  .command('certs')
  .option('-c, --cert', 'Path to certificate')
  .option('-p, --pass', 'Passphrase for the certificate')

.description('Utility to create a cert and key .pem')
  .action(function(args, callback) {
    logger(args.options);

    var cert_url = args.options.cert;
    var cert_pass = args.options.pass;

    if (cert_url && cert_pass) {

      utils.createCerts(cert_url, cert_pass).forEach(function(cmd) {
        require('child_process').execSync(cmd);
        console.log('run cmd', '$', cmd);
        callback();
      });
    } else {
      callback('Must provide cert and passhrase');
    }

  });



// TODO: Github Pass command


// TODO: Sign pass command.



cli
  .delimiter(program.pkg.name + '$')
  .show();
