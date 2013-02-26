
/**
 * Resource - This is the resource object that contains all of the REST api methods for a full CRUD on a mongo account document.
 *
 * @author Jonnie Spratley, AppMatrix
 * @created 10/23/12
 * 
 * REST METHODS:
 *
 * HTTP     METHOD          URL
 * ======|==============|==============================================
 * GET      findAll         http://localhost:3000/accounts
 * GET      findById        http://localhost:3000/accounts/:id
 * POST     add             http://localhost:3000/accounts
 * PUT      update          http://localhost:3000/accounts/:id
 * DELETE   destroy         http://localhost:3000/accounts/:id
 */

var mongo = require('mongodb'), Server = mongo.Server, Db = mongo.Db, BSON = mongo.BSONPure;
var server = new Server('localhost', 27017, {
    auto_reconnect : true
});




var Resource = {
    host : 'localhost',
    port : 27017,
     //I enable logging or not.
    debug : true,
    
    //I am the interal logger.
    log : function(obj) {
        if (Resource.debug) {
            console.log(obj);
        }
    },
   
     //I am the name of the database.
    databaseName : 'passbookmgr',
    // I am the name of this collection.
    name : 'passes',
    mongo : mongo,
    server : null,
    db : null,
    mongoServer : mongo.Server,
    mongoDb : mongo.Db,
    bson : mongo.BSONPure,
    //I am the example schema for this resources.
    schema : {
        id : '',
        ns : 'com.domain.app',
        title : '',
        body : '',
        address1 : '',
        address2 : '',
        city : '',
        state : '',
        zip : '',
        type : '',
        active : '0',
        created : '',
        modified : '',
        website : '',
        apple_url : '',
        android_url : '',
        user_id : '',
        application_id : '',
        appcellerator_url : '',
        settings : '',
        plan : '',
        exp_date : '',
        upfront_cost : '',
        monthly_cost : '',
        service_term : '12',
        service_value : '',
        total_value : '',
        sla_number : '',
        contract_in : '',
        app_submitted : ''
    },
    routes : {
        'status' : 'dbStatus'
    },
    //I create a new instance of the database.
    initDb : function(name) {
        Resource.name = name;
        Resource.server = new Server(Resource.host, Resource.port, {
            auto_reconnect : true,
            safe : false
        });
        Resource.db = new Db(Resource.databaseName, Resource.server);

        
        //Open the database and check for collection, if none then create it with the schema.
        Resource.db.open(function(err, db) {
            if (!err) {
                Resource.log('Connected to ' + Resource.databaseName);
                db.collection(name, {
                    safe : true
                }, function(err, collection) {
                    if (err) {
                        Resource.log('The collection doesnt exist. creating it with sample data...');
                        Resource.populateDb();
                    }
                });
            }
        });

    },
    //I populate the document db with the schema.
    populateDb : function() {
        Resource.db.collection(Resource.name, function(err, collection) {
            collection.insert(Resource.schema, {
                safe : true
            }, function(err, result) {
                Resource.log(result);
            });
        });
    },
    
    dbStatus: function(){
        console.log('get db status');
    },

     //### I find all of the records 
     //* @param {Object} req
     //* @param {Object} res
    findAll : function(req, res) {
        Resource.db.collection(Resource.name, function(err, collection) {
            collection.find().toArray(function(err, items) {
                Resource.log(Resource.name + ':findAll - ' + JSON.stringify(items));
                res.send(items);
            });
        });
    },
     //### I find one of the records by id.
     //* @param {Object} req
     //* @param {Object} res
    findById : function(req, res) {

        var id = req.params.id;

        Resource.log(Resource.name + ':findById - ' + id);

        Resource.db.collection(Resource.name, function(err, collection) {
            collection.findOne({
                '_id' : new Resource.BSON.ObjectID(id)
            }, function(err, item) {
                res.send(item);
            });
        });


    },
    /**
     * I add a record to the collection
     * @param {Object} req
     * @param {Object} res
     */
    add : function(req, res) {
        var data = req.body;

        Resource.log(Resource.name + ':add - ' + JSON.stringify(data));
        Resource.db.collection(Resource.name, function(err, collection) {
            collection.insert(data, {
                safe : true
            }, function(err, result) {
                if (err) {
                    res.send({
                        'error' : 'An error has occurred'
                    });
                } else {
                    Resource.log('Success: ' + JSON.stringify(result[0]));
                    res.send(result[0]);
                }
            });
        });
    },
    /**
     * I update a record in the collection
     * @param {Object} req
     * @param {Object} res
     */
    update : function(req, res) {
        var id = req.params.id;
        var data = req.body;
        Resource.log(Resource.name + ':destroy -' + id + ' - ' + JSON.stringify(data));
        Resource.db.collection(Resource.name, function(err, collection) {
            collection.update({
                '_id' : new Resource.BSON.ObjectID(id)
            }, data, {
                safe : true
            }, function(err, result) {
                if (err) {
                    res.send({
                        'error' : 'An error has occurred'
                    });
                    console.log('Error updating ' + Resource.name + ': ' + err);
                } else {
                    console.log('' + result + 'document(s) updated');

                    res.send(data);
                }
            });
        });
    },
    /**
     * I delete a record in the collection.
     * @param {Object} req
     * @param {Object} res

        return Todo.findById(req.params.id, function(err, todo) {
            return todo.remove(function(err) {
                if (!err) {
                    console.log("removed");
                    return res.send('')
                }
            });
        });
     */
    destroy : function(req, res) {
        var id = req.params.id;
        Resource.log(Resource.name + ':destroy -' + id);
        Resource.db.collection(Resource.name, function(err, collection) {
            collection.remove({
                '_id' : new Resource.BSON.ObjectID(id)
            }, {
                safe : true
            }, function(err, result) {
                if (err) {
                    res.send({
                        'error' : 'An error has occurred'
                    });
                    Resource.log('Error updating ' + Resource.name + ': ' + err);
                } else {
                    res.send(req.body);
                }
            });
        });
    }
};

//Export to public api
exports.Resource = Resource;



/**
 * Configuration Object to hold
 */
 
// Push options
var options = {
	gateway: 'gateway.sandbox.push.apple.com',
	cert: 'pusherCert.pem',
	key: 'pushKey.pem',
	passphrase: 'fred',
	port: 2195,
	enhanced: true,
	cacheLength: 100
};


/**
 * Configuration Object to hold
 */
var config = {
    name: 'Passbook Manager & API Server',
    version: 'v1',
    security : {
        salt : 'a58e325c6df628d07a18b673a3420986'
    },
    db : {
        username : 'amadmin',
        password : 'fred',
        host : 'localhost',
        port : 27017
    },
    staticDir: './app',
    publicDir: __dirname + '/www',
    uploadsTmpDir: './temp',
    uploadsDestDir: './app/files/uploads'
};



 
// Express server
var express = require('express');

// Express instance
var app = express();




app.configure(function() {
    app.use(express.bodyParser({
        keepExtensions : true,
        uploadDir : './app/files/uploads'
    }));

    app.use(express.static(config.staticDir));
    app.use(express.directory('./app'));

    app.use(express.logger('dev'));
    app.use("jsonp callback", true);

    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.send(500, 'Something broke!');
    });

    // simple logger
    app.use(function(req, res, next) {
        console.log('%s %s', req.method, req.url);
        next();
    });

});

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



// * REST METHODS:
// *
// * HTTP     METHOD          URL
// * ======|==============|==============================================
// * GET      findAll         http://localhost:4040/passbookmanager
// * GET      findById        http://localhost:4040/passbookmanager/passes/:id
// * POST     add             http://localhost:4040/passbookmanager/passes
// * PUT      update          http://localhost:4040/passbookmanager/passes/:id
// * DELETE   destroy         http://localhost:4040/passbookmanager/passes/:id

Resource.initDb('passes');

app.get('/api/'+config.version + '/passbookmanager/passes', Resource.findAll);
app.post('/api/'+config.version + '/passbookmanager/passes', Resource.add);
app.put('/api/'+config.version + '/passbookmanager/passes/:id', Resource.update);
app.get('/api/'+config.version + '/passbookmanager/passes/:id', Resource.findById);
app.post('/api/'+config.version + '/passbookmanager/passes/:id', Resource.destroy);
 
var port = 4040;


app.listen(port);
console.log('Passbook Manager & API Server listening on port ' + port);


