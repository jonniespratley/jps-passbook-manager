/**
 * @author Jonnie Spratley, AppMatrix
 * @created 02/26/13
 */
var mongo = require('mongodb');
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;
var fs = require('fs');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var express = require('express');
var app = express();


//Configuration Object to hold settings for server
var config = {
    name : 'passbookmanager',
    message : 'Passbook Manager API Server',
    version : 'v1',
    security : {
        salt : 'a58e325c6df628d07a18b673a3420986'
    },
    server:{
        host: 'localhost',
        port: 4040
    },
    db : {
        username : 'amadmin',
        password : 'fred',
        host : 'localhost',
        port : 27017
    },
    collections:['devices', 'passes', 'notifications', 'settings'],
    staticDir : './app',
    publicDir : __dirname + '/www',
    uploadsTmpDir : './temp',
    uploadsDestDir : './app/files/uploads'
};



 
//**Resource** - this is the resource object that contains all of the REST api methods for a full CRUD on a mongo account document.
var RestResource = {
    useversion : 'v1',
    urls : {
        v1 : '/api/v1',
        v2 : '/api/v2/'
    },
    //Configuration object from above, to hold settings
    config: null,
    //Init the resource applying the config object
    init: function(config){
        this.config = config;
    },
    //Display default message on index /
    index : function (req, res, next) {
        res.json({
            message : this.config.message + ' -  ' + config.version
        });
    },
    //Display list of default collections /
    collections : function (req, res, next) {
        res.json({
            message : config.message + ' -  ' + config.version,
            results: config.collections
        });
    },
    get : function (req, res, next) {
        var query = req.query.query ? JSON.parse(req.query.query) : {};
        // Providing an id overwrites giving a query in the URL
        if (req.params.id) {
            query = {
                '_id' : new BSON.ObjectID (req.params.id)
            };
        }
        //Pass a appid param to get all records for that appid
        if (req.param('appid')) {
            query['appid'] = String(req.param('appid'));
        }
        var options = req.params.options || {};
        //Test array of legal query params
        var test = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout'];
        //loop and test
        for (o in req.query ) {
            if (test.indexOf(o) >= 0) {
                options[o] = req.query[o];
            }
        }
        //Log for interal usage
        console.log('query', query, 'options', options);
        //new database instance
        var db = new mongo.Db (req.params.db, new mongo.Server (config.db.host, config.db.port, {
            auto_reconnect : true,
            safe : true
        }));
        //open database
        db.open(function (err, db) {
            if (err) {
                console.log(err);
            } else {
                //prep collection
                db.collection(req.params.collection, function (err, collection) {
                    //query
                    collection.find(query, options, function (err, cursor) {
                        cursor.toArray(function (err, docs) {
                            if (err) {
                                console.log(err);
                            } else {
                                var result = [];
                                if (req.params.id) {
                                    if (docs.length > 0) {
                                        result = Resource.flavorize(null, docs[0], "out");
                                        res.header('Content-Type', 'application/json');
                                        res.jsonp(200, result);
                                    } else {
                                        res.jsonp(404, 'Not found');
                                        //res.send(404);
                                    }
                                } else {
                                    docs.forEach(function (doc) {
                                        result.push(doc);
                                    });
                                    res.header('Content-Type', 'application/json');
                                    res.jsonp(200, result);
                                }
                                db.close();
                            }
                        });
                    });
                });
            }
        });
    },
    add : function (req, res, next) {
        var data = req.body;
        if (data) {
            var db = new mongo.Db (req.params.db, new mongo.Server (config.db.host, config.db.port, {
                auto_reconnect : true,
                safe : true
            }));
            db.open(function (err, db) {
                if (err) {
                    console.log(err);
                } else {
                    db.collection(req.params.collection, function (err, collection) {
                        collection.count(function (err, count) {
                            console.log("There are " + count + " records.");
                        });
                    });
                    var results = [];
                    db.collection(req.params.collection, function (err, collection) {
                        //Check if the posted data is an array, if it is, then loop and insert each document
                        if (data.length) {
                            //insert all docs
                            for (var i = 0; i < data.length; i++) {
                                var obj = data[i];
                                console.log(obj);
                                collection.insert(obj, function (err, docs) {
                                    results.push(obj);
                                });
                            }
                            db.close();
                            //  res.header('Location', '/'+req.params.db+'/'+req.params.collection+'/'+docs[0]._id.toHexString());
                            res.header('Content-Type', 'application/json');
                            res.jsonp(200, {
                                results : results
                            });
                        } else {
                            collection.insert(req.body, function (err, docs) {
                                res.header('Location', '/' + req.params.db + '/' + req.params.collection + '/' + docs[0]._id.toHexString());
                                res.header('Content-Type', 'application/json');
                                res.send('{"ok":1}', 201);
                                db.close();
                            });
                        }
                    });
                }
            });
        } else {
            res.header('Content-Type', 'application/json');
            res.send('{"ok":0}', 200);
        }
    },
    edit : function (req, res, next) {
        var spec = {
            '_id' : new BSON.ObjectID (req.params.id)
        };
        var db = new mongo.Db (req.params.db, new mongo.Server (config.db.host, config.db.port, {
            'auto_reconnect' : true,
            'safe' : true
        }));
        db.open(function (err, db) {
            db.collection(req.params.collection, function (err, collection) {
                collection.update(spec, req.body, true, function (err, docs) {
                    res.header('Location', '/' + req.params.db + '/' + req.params.collection + '/' + req.params.id);
                    res.header('Content-Type', 'application/json');
                    res.send('{"ok":1}');
                    db.close();
                    console.log('Location', '/' + req.params.db + '/' + req.params.collection + '/' + req.params.id);
                });
            });
        });
    },
    view : function (req, res, next) {
    },
    destroy : function (req, res, next) {
        var params = {
            _id : new BSON.ObjectID (req.params.id)
        };
        console.log('Delete by id ' + req.params.id);
        var db = new mongo.Db (req.params.db, new mongo.Server (config.db.host, config.db.port, {
            auto_reconnect : true,
            safe : true
        }));
        db.open(function (err, db) {
            db.collection(req.params.collection, function (err, collection) {
                console.log('found ', collection.collectionName, params);
                collection.remove(params, function (err, docs) {
                    if (!err) {
                        res.header('Content-Type', 'application/json');
                        res.send('{"ok":1}');
                        db.close();
                    } else {
                        console.log(err);
                    }
                });
            });
        });
    }
};
app.configure(function () {
    app.use(express.bodyParser({
        keepExtensions : true,
        uploadDir : './app/files/uploads'
    }));
    app.use(express.static(config.staticDir));
    app.use(express.directory('./app'));
    app.use(express.logger('dev'));
    app.use("jsonp callback", true);
    
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.send(500, 'Something broke!');
    });
    // simple logger
    app.use(function (req, res, next) {
        console.log('%s %s', req.method, req.url);
        next();
    });
});




/* ======================[ @TODO: Listen for Device registration token ]====================== */

//callback handler
var onError = function (error, note) {
    console.log('Error is: %s', error);
    console.log('Note ' + note);
};

//Test device tokens
var deviceTokens = [
	'54563ea0fa550571c6ea228880c8c2c1e65914aa67489c38592838b8bfafba2a', 
	'd46ba7d730f8536209e589a3abe205b055d66d8a52642fd566ee454d0363d3f3'
];

//API Endpoint
app.get('/api', function(req, res){
  var body = config.name;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});


//API Version Endpoint - http://localhost:3535/smartpass/v1	
app.get('/api/'+config.version, function(req, res) {
	res.json({message: config.name});
});
 
 
 
//Register Pass Endpoint
app.post('/api/'+config.version+'/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', function(req, res) {
	res.json({message: config.name});
});

//Logging Endpoint
app.post('/api/'+config.version+'/log', function(req, res) {
	console.log(req.body);
	res.json({message: config.name});
});

//Unregister Pass
app.delete('/api/'+config.version+'/devices/:deviceLibraryIdentifier/:passTypeIdentifier/:serialNumber', function(req, res) {
	console.log( 'Register device ' + req.param('token'));
    res.json({message: config.name + ' - ' + 'Delete device ' + req.param('token')});

});

//Register device
app.get('/api/'+config.version+'/register/:token', function(req, res){
	console.log( 'Register device ' + req.param('token'));
    res.json({message: config.name + ' - ' + 'Register device ' + req.param('token')});
});

//Get serial numbers
app.get('/api/'+config.version+'/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier', function(req, res){

	console.log('Push to device ' + req.param('token'));
    res.json({message: config.name + ' - ' + 'Push to device ' + req.param('token')});
});

//Get latest version of pass
app.get('/api/'+config.version+'/passes/:passTypeIdentifier/:serialNumber', function(req, res){

	console.log('Push to device ' + req.param('token'));
});

//Send push to device
app.get('/api/'+config.version+'/push/:token', function(req, res){
	console.log('Push to device ' + req.param('token'));
});




//Initialize the REST resource server with our configuration object.
RestResource.init(config);


// * REST METHODS:
// *
// * HTTP     METHOD          URL
// * ======|==============|==============================================
// * GET      findAll         http://localhost:4040/passbookmanager
// * GET      findById        http://localhost:4040/passbookmanager/passes/:id
// * POST     add             http://localhost:4040/passbookmanager/passes
// * PUT      update          http://localhost:4040/passbookmanager/passes/:id
// * DELETE   destroy         http://localhost:4040/passbookmanager/passes/:id
app.get('/api/' + config.version + '/' + config.name, RestResource.collections);
app.get('/api/' + config.version + '/:db/:collection/:id?', RestResource.get);
app.post('/api/' + config.version + '/:db/:collection', RestResource.add);
app.put('/api/' + config.version + '/:db/:collection/:id', RestResource.edit);
app.delete ('/api/' + config.version + '/:db/:collection/:id', RestResource.destroy);

app.listen(config.server.port);
console.log(config.message + ' running @' + config.server.host + ':' + config.server.port);


