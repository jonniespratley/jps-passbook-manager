# Passbook Manager
This is a simple interface for creating iOS Passbook passes from content.


There are three major parts to the pass life cycle: creation, management, and redemption. 
Passbook handles the middle; it lets users view and manage their passes and provides lock screen integration. 

> You are responsible for the two ends: creating passes and redeeming passes.




## Getting Started
This is a simple web app interface for creating iOS Passbook passes from content.


### 1. Fork It
Clone or fork this repo. 

Execute command:

	$ git clone https://github.com/jonniespratley/jps-passbook-manager.git


### 2. Install It
You must install the dependencys for this node.js application to work properly.

Execute command:

	$ npm install


### 3. Start It
Then start the passbook manager and web service api server.

Execute command:

	$ node server

You should see the following output:

	$ node server
	Passbook Manager & API Server listening on port 4040

Open your browser to localhost:4040

----

## How To



### Creating a pass
Just use the form to create your pass and save it.



### Signing a pass
Just use the manager to sign your passes, or execute this command:

	./signpass -p Name.pass




### Validating a pass




### Distributing a pass


## Pass Documentation
Please refer to the Apple Passbook Programming guide for more detail information.

## Release History
_(Nothing yet)_















