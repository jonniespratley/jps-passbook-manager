/*
var level = require('level');           //[1]
var db = level(__dirname + '/db', {valueEncoding: 'json'});

var levelSubscribe = require('./levelSubscribe');     //[2]
db = levelSubscribe(db);

db.subscribe({doctype: 'tweet', language: 'en'},     //[3]
  function(k, val){
    console.log(val);
  });
                  //[4]
db.put('1', {doctype: 'tweet', text: 'Hi', language: 'en'});
db.put('2', {doctype: 'company', name: 'ACME Co.'});
*/
module.exports = function levelSubscribe(db) {

  db.subscribe = function(pattern, listener) { //[1]
    db.on('put', function(key, val) { //[2]
      var match = Object.keys(pattern).every(function(k) { //[3]
        return pattern[k] === val[k];
      });
      if (match) {
        listener(key, val); //[4]
      }
    });
  };

  return db;
}
