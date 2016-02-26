# Pass Manager
This is a simple web app for creating and managing Apple Wallet passes.

[![Coverage Status](https://coveralls.io/repos/jonniespratley/jps-passbook-manager/badge.svg?branch=develop&service=github)](https://coveralls.io/github/jonniespratley/jps-passbook-manager?branch=develop)

[![Build Status](https://travis-ci.org/jonniespratley/jps-passbook-manager.svg?branch=develop)](https://travis-ci.org/jonniespratley/jps-passbook-manager)

[![API Doc](https://doclets.io/jonniespratley/jps-passbook-manager/develop.svg)](https://doclets.io/jonniespratley/jps-passbook-manager/develop)

## Getting Started
This is a simple web app for creating and managing Apple Wallet passes.

### 1. Fork It
Clone or fork this repo.

```
$ git clone https://github.com/jonniespratley/jps-passbook-manager.git
```

### 2. Install
You must install the dependencies.

```
$ npm install
```

### 3. Start
Then start the server.

```
$ npm start
```

> Open your browser to localhost:[config.port]


## Release History
_(Nothing yet)_


---

## How To

1. ### Create Pass Type ID Certificate
To create a Pass Type ID. Visit the link below and follow the screenshots.

    > [https://developer.apple.com/account/ios/identifiers/passTypeId/passTypeIdList.action](https://developer.apple.com/account/ios/identifiers/passTypeId/passTypeIdList.action)
    
    ![image](https://dl.dropboxusercontent.com/u/26906414/jps-passbook-manager/step-1.png)
    ![image](https://dl.dropboxusercontent.com/u/26906414/jps-passbook-manager/step-2.png)
    ![image](https://dl.dropboxusercontent.com/u/26906414/jps-passbook-manager/step-3.png)
    ![image](https://dl.dropboxusercontent.com/u/26906414/jps-passbook-manager/step-4.png)

2. ### Export .cert to disk
Launch the Keychain Access utility. -From the menu, select Keychain Access | Certificate Assistant | Request a Certificate from a Certificate Authority. 
In the Certificate Information window, enter the following:    
    * User Email Address: Enter the e-mail address associated with your iOS developer account.
    * Common Name: Choose a name that relates to the Pass Type ID.
    * CA Email Address: Leave this field blank
    * Request is: Choose Saved to Disk

* ### Creating a pass
To create a pass open the terminal and execute the following command:

* ### Validating a pass
To validate a pass open the terminal and execute the following command:

* ### Signing a pass
To sign a pass open the terminal and execute the following command:

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

* ### Distributing a pass
Use the following Terminal commands to generate a certificate file and a key.pem file.

> https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html#//apple_ref/doc/uid/TP40012195-CH4-SW55

    ```
    openssl pkcs12 -in pass.p12 -clcerts -nokeys -out pass-certificate.pem -password pass:fred
    openssl pkcs12 -in pass.p12 -nocerts -out pass-key.pem
    
    open sslsmime -binary -sign -certfile wwdr.pem -signer pass-cert.pem -inkey pass-key.pem -in manifest.json -out signature -outform DER -passin pass:fred
    ```

* ### Create Signing Certificates

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
