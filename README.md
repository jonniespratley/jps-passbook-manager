# Passbook Manager
This is a simple interface for creating iOS Passbook passes from content.


[![Build Status](https://travis-ci.org/jonniespratley/jps-passbook-manager.svg?branch=develop)](https://travis-ci.org/jonniespratley/jps-passbook-manager)

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



## Pass Package Structure


* background.png - The image displayed as the background of the front of the pass.
footer.png - The image displayed on the front of the pass near the barcode.
* icon.png - The pass’s icon. This is displayed in notifications and in emails that have a pass attached, and on the lock screen.
* logo.png - The image displayed on the front of the pass in the top left.
* manifest.json - A JSON dictionary. Each key is the path to a file (relative to the top level of the bundle) and the key’s value is the SHA-1 hash for that file. Every file in the bundle appears in the manifest, except for the manifest itself and the signature.
* pass.json - A JSON dictionary that defines the pass. Its contents are described in detail in Top-Level Keys.
* signature - A detached PKCS #7 signature of the manifest.json file.
* strip.png - The image displayed behind the primary fields on the front of the pass.
* thumbnail.png - An additional image displayed on the front of the pass. For example, on a membership card, the thumbnail could be used to a picture of the cardholder.









## Example Commands

```
jps in ~/Github/jps-passbook-manager on develop*
⚡ bin/signpass -p /Users/jps/Github/jps-passbook-manager/.tmp/pass-1451800252971/Test_Pass_.raw
2016-01-02 21:51:50.126 signpass[26636:472827] {
    "icon.png" = f8a2bb1b52c426275312c98c626d5be92758170e;
    "icon@2x.png" = 4204eafa4ac2df2339cf3308a2b0ecd228732589;
    "logo.png" = 0a790897e6b8040fe73baa99053b706939f65d07;
    "logo@2x.png" = b98b0504f4f067de4f7a6c1e95df8a78024dc3bb;
    "pass.json" = e7d4183137d35a48019f8ecb4eaed3e457482d32;
}
jps in ~/Github/jps-passbook-manager on develop*
⚡ bin/signpass -v /Users/jps/Github/jps-passbook-manager/.tmp/pass-1451800252971/Test_Pass_.pkpass
Signature valid.
Certificates: (
	0: Apple Worldwide Developer Relations Certification Authority
	1: Pass Type ID: pass.passbookmanager.io
)
Trust chain is valid.

*** SUCCEEDED ***
```
