module.exports = function(program, app) {
  'use strict';
  if (!program) {
    throw new Error('Must provide a program as argument 1');
  }
  if (!app) {
    throw new Error('Must provide an express app as argument 2');
  }
  var expressWs = require('express-ws')(app);
  app.use(function(req, res, next) {
    program.log.debug('jps-passbook-sockets -', req.method, req.params, req.url);

    req.testing = 'testing';
    return next();
  });

  /*

  var io = require('socket.io').listen(server);
  io.on('connection', function(socket){
    socket.emit('newlog', logs);
  });


  */


  app.ws('/', function(ws, req) {
    //Enable logging before everything

    var intercept = require("intercept-stdout");
    var logs = [];
    var intercept_func = intercept(function(data) {
      logs.push({
        msg: data
      });
      if (ws) {
        ws.send('newlog', [{
          msg: data
        }]);
      }
    });

    ws.on('message', function(msg) {
      console.log(msg);
    });



    console.log('socket', req.testing);
  });
};
