#!/usr/bin/env node

'use strict';
const assert = require('assert');
const fs = require('fs-extra');
const _ = require('lodash');
const path = require('path');
const request = require('request');
const cli = require('commander');

const program = require(path.resolve(__dirname, './program.js'))();
const logger = program.utils.getLogger('cli');
const utils = program.utils;
const SignPass = program.require('signpass');
const db = program.db;


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

cli
  .version('0.0.1')
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);

console.log('you ordered a pizza with:');
if (cli.peppers) console.log('  - peppers');
if (cli.pineapple) console.log('  - pineappe');
if (cli.bbq) console.log('  - bbq');
console.log('  - %s cheese', cli.cheese);
