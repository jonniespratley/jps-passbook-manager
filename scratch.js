var redis = require('redis');
var port = '34198';
var hostname = '10.72.6.22';
var password = 'b11324e2-2460-45e5-9d2d-c8d971649656';
var client = redis.createClient(port, hostname, {
	no_ready_check: false
});
client.auth('password', function(err) {
	if (err) {
		throw err;
	}
});
client.set("foo", "bar", redis.print);
client.get("foo", function(err, reply) {
	if (err) throw err;
	console.log(reply.toString());
});
client.on('connect', function() {
	console.log('Connected to Redis');
});
