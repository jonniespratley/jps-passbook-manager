# Passbook Manager
This is a simple interface for creating iOS Passbook passes from content.






## Getting Started
Fork this repo and start the web server by using:

yeoman server

Then start the passbook web service server by using:

node server


# Overview
There are three major parts to the pass life cycle: creation, management, and redemption. Passbook handles the middle; it lets users view and manage their passes and provides lock screen integration. You are responsible for the two ends: creating passes and redeeming passes.




### Creating a pass



### Signing a pass



### Validating a pass




### Distributing a pass







* What your product can do
* If your product is what they’ve been looking for
* If your product will help users accomplish their tasks - This
* Whether or not they should join your service or pay for your product
* Address issues or concerns up front
* Address the top concerns your users might have when they are trying to decide whether or not to use your product or not. 
* “Is it safe”, 
* “Can I import my app easily?”, 
* “Can I export my app if I decide to move?”.  



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



## Documentation
Please refer to the Apple Passbook Programming guide for more detail information.

### Pass Style Sets the Overall Visual Appearance

The pass’s style determines the overall visual appearance of the pass and the template for placement of information on the pass. The most distinctive visual indication of the style is at the top edge of the pass: event tickets have a small cutout, coupons have a perforated edge, and so on.

Unlike pass type identifiers, which you define, the pass styles are part of the API, as is their meaning. There is no facility for you to change them or add new ones. Pass type identifiers categorize passes in a very specific way; pass styles categorize passes in a much more general high-level way.

You specify the pass style by providing the corresponding key at the top level of the pass.json file:

## Release History
_(Nothing yet)_















