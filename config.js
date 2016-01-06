'use strict';

//TODO - Change to your values
const APPLE_TEAM_IDENTIFIER = 'USE9YUYDFH';
const APPLE_PASS_TYPE_IDENTIFIER = 'pass.passbookmanager.io';
const APPLE_WEB_SERVICE_URL = 'https://passbook-manager.run.aws-usw02-pr.ice.predix.io/api/v1';

var VCAP_SERVICES = {
	"logstash-4": [{
		"name": "my_logstash_instance",
		"label": "logstash-4",
		"tags": ["logstash14", "logstash", "syslog"],
		"plan": "free",
		"credentials": {
			"hostname": "10.72.6.64",
			"ports": {
				"514/tcp": "32786",
				"9200/tcp": "32787",
				"9300/tcp": "32788"
			}
		},
		"syslog_drain_url": "syslog://10.72.6.64:32786"
	}],
	"predix-uaa": [{
		"name": "my_uaa_instance",
		"label": "predix-uaa",
		"tags": [],
		"plan": "Beta",
		"credentials": {
			"issuerId": "https://69687fd0-c926-4e4f-8563-5c88042db69c.predix-uaa.run.aws-usw02-pr.ice.predix.io/oauth/token",
			"zone": {
				"http-header-value": "69687fd0-c926-4e4f-8563-5c88042db69c",
				"http-header-name": "X-Identity-Zone-Id"
			},
			"uri": "https://69687fd0-c926-4e4f-8563-5c88042db69c.predix-uaa.run.aws-usw02-pr.ice.predix.io"
		}
	}],
	"predix-mobile": [{
		"name": "my_predix_mobile_instance",
		"label": "predix-mobile",
		"tags": [],
		"plan": "Beta",
		"credentials": {
			"dbname": "pm",
			"hostname": "204049.run.aws-usw02-pr.ice.predix.io",
			"port": "443",
			"ports": {
				"443/tcp": "443",
				"80/tcp": "80"
			},
			"instance_id": "cf73d03f-1b33-468f-be94-1384be736204",
			"api_gateway_direct_route": "https://cf73d03f-1b33-468f-be94-1384be736204-pm-gateway.run.aws-usw02-pr.ice.predix.io/",
			"api_gateway_short_route": "https://204049.run.aws-usw02-pr.ice.predix.io/",
			"uri": "https://204049.run.aws-usw02-pr.ice.predix.io/"
		}
	}],
	"redis-1": [{
		"name": "my_redis_instance",
		"label": "redis-1",
		"tags": ["pivotal", "redis"],
		"plan": "shared-vm",
		"credentials": {
			"host": "10.72.6.22",
			"password": "b11324e2-2460-45e5-9d2d-c8d971649656",
			"port": 34198
		}
	}]
};

var config = {
	"name": "passbookmanager",
	"message": "Passbook Manager API Server",
	"version": "v1",
	"dataPath": "./data",
	"passkit": {
		"teamIdentifier": APPLE_TEAM_IDENTIFIER,
		"passTypeIdentifier": APPLE_PASS_TYPE_IDENTIFIER,
		"webServiceURL": APPLE_WEB_SERVICE_URL
	},
	"security": {
		"salt": "a58e325c6df628d07a18b673a3420986"
	},
	"server": {
		"host": "localhost",
		"port": 5001
	},
	"db": {
		"local": "passbookmanager",
		"remote": "http://localhost:5984/passbookmanager"
	},
	"collections": [
		"devices",
		"passes",
		"notifications",
		"settings"
	],
	"staticDir": "./app",
	"publicDir": "./www",
	"uploadsTmpDir": "./.tmp",
	"uploadsDestDir": "./www"
};

module.exports = config;
