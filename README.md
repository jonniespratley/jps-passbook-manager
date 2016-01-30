# Passbook Manager
This is a simple interface for creating iOS Passbook passes from content.
[![Coverage Status](https://coveralls.io/repos/jonniespratley/jps-passbook-manager/badge.svg?branch=develop&service=github)](https://coveralls.io/github/jonniespratley/jps-passbook-manager?branch=develop)

[![Build Status](https://travis-ci.org/jonniespratley/jps-passbook-manager.svg?branch=develop)](https://travis-ci.org/jonniespratley/jps-passbook-manager)

There are three major parts to the pass life cycle: creation, management, and redemption.
Passbook handles the middle; it lets users view and manage their passes and provides lock screen integration.

> You are responsible for the two ends: creating passes and redeeming passes.


## Getting Started
This is a simple web app interface for creating iOS Passbook passes from content.

> Note: https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/PassKit_PG/index.html#//apple_ref/doc/uid/TP40012195-CH1-SW1

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

https://developer.apple.com/library/ios/documentation/PassKit/Reference/PassKit_WebService/WebService.html



## How To


You will now need to create a Pass Type ID. Follow the link on the left menu for Pass Type IDs or visit:

> [https://developer.apple.com/account/ios/identifiers/passTypeId/passTypeIdList.action](https://developer.apple.com/account/ios/identifiers/passTypeId/passTypeIdList.action)

Click on the + button to create a new Pass Type ID. You will need to create a Pass Type ID for each type of Pass you intend to create. The types of Passes currently available to create are Boarding Pass, Coupon, Event Ticket, Store Card, and Generic. T

![image](https://www.safaribooksonline.com/library/view/instant-passbook-app/9781849697064/graphics/7064OT_01_08.jpg)

![image](https://www.safaribooksonline.com/library/view/instant-passbook-app/9781849697064/graphics/7064OT_01_09.jpg)


#### Export .cert to disk

1. Launch the Keychain Access utility. -From the menu, select Keychain Access | Certificate Assistant | Request a Certificate from a Certificate Authority. In the Certificate Information window, enter the following:

* User Email Address: Enter the e-mail address associated with your iOS developer account.
* Common Name: Choose a name that relates to the Pass Type ID.
* CA Email Address: Leave this field blank
* Request is: Choose Saved to Disk

1. #### Creating a pass

* #### Validating a pass

* #### Signing a pass

```
openssl smime -binary -sign \
	-certfile /Users/jps/Github/jps-passbook-manager/certificates/wwdr-authority.pem \
	-signer /Users/jps/Github/jps-passbook-manager/certificates/pass-cert.pem \
	-inkey /Users/jps/Github/jps-passbook-manager/certificates/pass-key.pem \
	-in /var/folders/pw/y2bdztx93jl73s811y60dtx40000gn/T/mock-coupon.raw/manifest.json \
	-out /var/folders/pw/y2bdztx93jl73s811y60dtx40000gn/T/signature \
	-outform DER \
	-password pass:fred
```

* #### Distributing a pass

Use the following Terminal commands to generate a certificate.pem file and a key.pem file.

https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html#//apple_ref/doc/uid/TP40012195-CH4-SW55

```
openssl pkcs12 -in pass.p12 -clcerts -nokeys -out pass-certificate.pem -password pass:fred
openssl pkcs12 -in pass.p12 -nocerts -out pass-key.pem

open sslsmime -binary -sign -certfile wwdr.pem -signer pass-cert.pem -inkey pass-key.pem -in manifest.json -out signature -outform DER -passin pass:fred
```

* #### Create Certs

```
$ openssl pkcs12 -in certificates/pass.p12 -password pass:fred -clcerts -nokeys -out certificates/pass-cert.pem
```

```
$ openssl pkcs12 -in certificates/pass.p12 -password pass:fred -nocerts -out certificates/pass-key.pem
```


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
