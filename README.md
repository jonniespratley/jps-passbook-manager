# Passbook Manager
This is a simple interface for creating iOS Passbook passes from content.
[![Coverage Status](https://coveralls.io/repos/jonniespratley/jps-passbook-manager/badge.svg?branch=develop&service=github)](https://coveralls.io/github/jonniespratley/jps-passbook-manager?branch=develop)

[![Build Status](https://travis-ci.org/jonniespratley/jps-passbook-manager.svg?branch=develop)](https://travis-ci.org/jonniespratley/jps-passbook-manager)

There are three major parts to the pass life cycle: creation, management, and redemption.
Passbook handles the middle; it lets users view and manage their passes and provides lock screen integration.

> You are responsible for the two ends: creating passes and redeeming passes.


## Getting Started
This is a simple web app interface for creating iOS Passbook passes from content.


### 1. Fork It
Clone or fork this repo.

Execute command:

```
$ git clone https://github.com/jonniespratley/jps-passbook-manager.git
```

### 2. Install
You must install the dependencys for this node.js application to work properly.

```
$ npm install
```

### 3. Start
Then start the passbook manager and web service api server.

```
$ npm start
```

> Open your browser to localhost:4040


## Release History
_(Nothing yet)_





## How To

1. #### Creating a pass

* #### Validating a pass

* #### Signing a pass

* #### Distributing a pass

* #### Create Certs + Sign Pass

```
$ openssl pkcs12 -in cert.p12 -clcerts -nokeys -out certificate.pem

$ openssl pkcs12 -in cert.p12 -nocerts -out key.pem

$ openssl smime -sign \
              -detach \
              -in manifest.json \
              -out ./signature \
              -outform DER \
              -inkey ./certificates/pass-passbookmanager-key.p12 \
              -signer ./certificates/AppleWWDRCA.cer


```







```
