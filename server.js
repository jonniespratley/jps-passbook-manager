/**
 * @author Jonnie Spratley, AppMatrix
 * @created 02/26/13
 */
//## Dependencies
var mongo = require('mongodb');
var path = require('path');
var Server = mongo.Server;
var Db = mongo.Db;
var BSON = mongo.BSONPure;
var fs = require('fs');
var http = require('http');
var url = require('url');
var qs = require('querystring');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient, assert = require('assert');

var port = process.env.PORT || 1333;
var host = process.env.VCAP_APP_HOST || "127.0.0.1";
//Configuration Object to hold settings for server
var config = {
    name: 'passbookmanager',
    message: 'Passbook Manager API Server',
    version: 'v1',
    security: {
        salt: 'a58e325c6df628d07a18b673a3420986'
    },
    server: {
        host: host,
        port: port
    },
    db: {
        username: 'demouser',
        password: 'demopassword',
        host: 'ds031611.mongolab.com',
        port: 31611,
        url: 'mongodb://admin:admin@ds031611.mongolab.com:31611/passbookmanager'
    },
    collections: ['devices', 'passes', 'notifications', 'settings'],
    staticDir: './app',
    publicDir: __dirname + path.sep + 'www',
    uploadsTmpDir: __dirname + path.sep + '.tmp',
    uploadsDestDir: __dirname + path.sep + 'www'
};

var cloudServices = null;
var dbcreds = null;
var dbconn = null;

//Test if services
if (process.env.VCAP_SERVICES) {
    cloudServices = JSON.parse(process.env.VCAP_SERVICES);

    console.warn('cloud services', cloudServices);
    //var dbcreds = services['mongodb'][0].credentials;
}

if (dbcreds) {
    console.log(dbcreds);
    dbconn = mongoose.connect(dbcreds.host, dbcreds.db, dbcreds.port, {
        user: dbcreds.username,
        pass: dbcreds.password
    });
    console.log("attempting to connect to mongodb");
}


if (process.env.MONGODB_URL) {
    config.db.url = process.env.MONGODB_URL;
    console.warn('trying to connecto to ', process.env.MONGODB_URL);
    dbconn = mongoose.connect(process.env.MONGODB_URL);
}


// Connection URL
var url = config.db.url;


//## REST Resource
//This is the resource object that contains all of the REST api methods for a full CRUD on a mongo account document.
var RestResource = {
    useversion: 'v1',
    name: 'passes',
    databaseName: 'passbookmanager',
    urls: {
        v1: '/api/v1',
        v2: '/api/v2/'
    },
    //Configuration object from above, to hold settings
    config: null,
    server: null,
    db: null,
    mongoServer: mongo.Server,
    mongoDb: mongo.Db,
    bson: mongo.BSONPure,
    host: config.db.host,
    port: config.db.port,
    /**
     * I am the example schema for this resources.
     */
    schema: {
        id: 0,
        appid: 'com.domain.app',
        title: 'This is the title',
        body: 'This is the body.',
        created: new Date(),
        modified: new Date
    },
    /**
     * I enable logging or not.
     */
    debug: true,
    /**
     * I am the interal logger.
     */
    log: function (obj) {
        if (this.debug) {
            console.log(obj);
        }
    },
    //Init the resource applying the config object
    init: function (config) {
        var self = this;
        this.config = config;

        MongoClient.connect(config.db.url, function (err, db) {
            self.db = db;
            if (!err) {
                self.log('Connected to ' + self.databaseName);
                db.collection(self.name, {
                    safe: true
                }, function (err, collection) {
                    if (err) {
                        self.log('The collection ' + self.name + ' exist. creating it with sample data...', self.populateDb());
                        self.populateDb();
                    }
                });
            }
        });

    },

    //### index()
    //Display default message on index
    index: function (req, res, next) {
        res.json({
            message: this.config.message + ' -  ' + config.version
        });
    },

    //### collections()
    //Display list of default collections
    collections: function (req, res, next) {
        res.json({
            message: config.message + ' -  ' + config.version,
            results: config.collections
        });
    },

    //### get()
    //Fetch all records.
    get: function (req, res, next) {
        var self = this;
        var query = req.query.query ? JSON.parse(req.query.query) : {};

        // Providing an id overwrites giving a query in the URL
        if (req.params.id) {
            query = {
                '_id': new BSON.ObjectID(req.params.id)
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
        for (o in req.query) {
            if (test.indexOf(o) >= 0) {
                options[o] = req.query[o];
            }
        }
        //Log for interal usage
        console.log('query', query, 'options', options);

        //open database
        MongoClient.connect(config.db.url, function (err, db) {
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
                                        result = self.flavorize(null, docs[0], "out");
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

    //### add()
    //Handle saving a document to the database.
    add: function (req, res, next) {
        var data = req.body;
        if (data) {

            MongoClient.connect(config.db.url, function (err, db) {
                console.warn('adding to db', db, data);
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
                                results: results
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

    //### edit()
    //Handle updating a document in the database.
    edit: function (req, res, next) {
        var spec = {
            '_id': new BSON.ObjectID(req.params.id)
        };

        MongoClient.connect(config.db.url, function (err, db) {
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

    //### view()
    //Handle fetching associated documents for document detail view.
    view: function (req, res, next) {
    },

    //### populateDb()
    //I populate the document db with the schema.
    populateDb: function () {
        var self = this;
        RestResource.db.collection(self.name, function (err, collection) {
            collection.insert(self.schema, {
                safe: true
            }, function (err, result) {
                self.log(result);
            });
        });
    },

    dbStatus: function () {
        console.log('get db status');
    },
    /**
     * I find all of the records
     * @param {Object} req
     * @param {Object} res
     */
    findAll: function (req, res) {
        RestResource.db.collection(req.params.collection, function (err, collection) {
            collection.find().toArray(function (err, items) {
                RestResource.log(req.params.collection + ':findAll - ' + JSON.stringify(items));
                res.send(items);
            });
        });
    },
    /**
     * I find one of the records by id.
     * @param {Object} req
     * @param {Object} res
     */
    findById: function (req, res) {
        var id = req.params.id;
        this.log(RestResource.name + ':findById - ' + id);
        RestResource.db.collection(RestResource.name, function (err, collection) {
            collection.findOne({
                '_id': new BSON.ObjectID(id)
            }, function (err, item) {
                res.send(item);
            });
        });
    },
    destroy: function (req, res, next) {
        var params = {
            _id: new BSON.ObjectID(req.params.id)
        };
        console.log('Delete by id ' + req.params.id);
        var db = new mongo.Db(req.params.db, new mongo.Server(config.db.host, config.db.port, {
            auto_reconnect: true,
            safe: true
        }));

        RestResource.db.collection(req.params.collection, function (err, collection) {
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

    }
};

//### readFile()
//Get file contents from a file
function getFile(localPath, mimeType, res) {
    fs.readFile(localPath, function (err, contents) {
        if (!err) {
            res.writeHead(200, {
                "Content-Type": mimeType,
                "Content-Length": contents.length
            });
            res.end(contents);
        } else {
            res.writeHead(500);
            res.end();
        }
    });
};

//### writeFile()
//Write contents to a file
function writeFile(localPath, contents, callback) {
    // create a stream, and create the file if it doesn't exist
    stream = fs.createWriteStream(localPath);
    console.log('writeFile', localPath);
    stream.on("open", function () {
        // write to and close the stream at the same time
        stream.end(contents, 'utf-8');
        callback({
            name: localPath,
            contents: contents
        });
    });
};

/**
 * Command Server for executing build commands from the Web app.
 */
var sys = require('sys')
var exec = require('child_process').exec;
var child;

/* ======================[ @TODO: Listen for Device registration token ]====================== */

//### onError()
//callback handler
var onError = function (error, note) {
    console.log('Error is: %s', error);
    console.log('Note ' + note);
};

//Test device tokens
var deviceTokens = ['54563ea0fa550571c6ea228880c8c2c1e65914aa67489c38592838b8bfafba2a', 'd46ba7d730f8536209e589a3abe205b055d66d8a52642fd566ee454d0363d3f3'];

//API Endpoint
app.get('/api', function (req, res) {
    var body = config.name;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', body.length);
    res.end(body);
});

//Execute command - http://localhost:4040/api/v1/cmd/ls
app.get('/api/' + config.version + '/' + 'cmd' + '/' + ':command', function (req, res) {
    var results = {};

    child = exec(req.params.command, function (error, stdout, stderr) {
        results.stdout = stdout;
        sys.print('stdout: ' + stdout);

        if (error !== null) {
            console.log('exec error: ' + error);
        }

        res.json({
            message: config.name,
            results: results
        });
    });
});

//API Version Endpoint - http://localhost:3535/smartpass/v1
app.get('/api/' + config.version, function (req, res) {
    res.json({
        message: config.name
    });
});

//Register Pass Endpoint
app.post('/api/' + config.version + '/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber', function (req, res) {
    res.json({
        message: config.name
    });
});

//Logging Endpoint
app.post('/api/' + config.version + '/log', function (req, res) {
    console.log(req.body);
    res.json({
        message: config.name
    });
});

//Unregister Pass
app.delete('/api/' + config.version + '/devices/:deviceLibraryIdentifier/:passTypeIdentifier/:serialNumber', function (req, res) {
    console.log('Register device ' + req.param('token'));
    res.json({
        message: config.name + ' - ' + 'Delete device ' + req.param('token')
    });

});

//Register device
app.get('/api/' + config.version + '/register/:token', function (req, res) {
    console.log('Register device ' + req.param('token'));
    res.json({
        message: config.name + ' - ' + 'Register device ' + req.param('token')
    });
});

//Get serial numbers
app.get('/api/' + config.version + '/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier', function (req, res) {
    console.log('Push to device ' + req.param('token'));
    res.json({
        message: config.name + ' - ' + 'Push to device ' + req.param('token')
    });
});

//Get latest version of pass
app.get('/api/' + config.version + '/passes/:passTypeIdentifier/:serialNumber', function (req, res) {
    console.log('Push to device ' + req.param('token'));
});

//Send push to device
app.get('/api/' + config.version + '/push/:token', function (req, res) {
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
app.get('/api/' + config.version + '/:db/:collection/:id?', RestResource.findAll);
app.get('/api/' + config.version + '/:db/:collection/:id?', RestResource.findById);
app.post('/api/' + config.version + '/:db/:collection', bodyParser.json(), RestResource.add);
app.put('/api/' + config.version + '/:db/:collection/:id', bodyParser.json(), RestResource.edit);
app.delete('/api/' + config.version + '/:db/:collection/:id', RestResource.destroy);

/**
 * TODO - Sign a pass
 */
var signpass = require(__dirname + '/routes/jps-passbook');

/**
 * I am the signpass route
 */
app.get('/api/' + config.version + '/:db/:collection/:id/sign', function (req, res) {
    var passFile = req.param('path');
    if (passFile) {
        signpass.sign(passFile, function () {
            res.send(200, {message: passFile + ' signed.'});
        });
    } else {
        res.send(400, {message: 'Must provide path to .raw folder!'});
    }
});


/**
 * I am the export pass route.
 *
 * I handle taking a pass's id, quering the database,
 * taking the contents of the pass and invoking the createPass method which
 * creates a .raw folder containing a pass.json file and then invokes the
 * signpass binary.
 *
 */
app.get('/api/' + config.version + '/:db/:collection/:id/export', function (req, res) {
    var id = req.param('id');
    if (id) {
        console.log(RestResource.name + ':findById - ' + id);

        RestResource.db.collection(RestResource.name, function (err, collection) {
            collection.findOne({
                '_id': new BSON.ObjectID(id)
            }, function (err, item) {
                if (err) {
                    res.send(400, err);
                }
                passContent = item;
                console.log('found pass', item);
                try {
                    signpass.createPass(config.publicDir, passContent, function (data) {
                        res.send(data);
                    });
                } catch (e) {
                    res.send(500, e);
                }
            });
        });
    } else {
        res.send(400, 'Must provide file path!');
    }
});


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

//Start the server
app.listen(config.server.port, function () {
    console.log(config.message + ' running @' + config.server.host + ':' + config.server.port);
});
