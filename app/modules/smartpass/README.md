# SmartPass (Module)
This module extends the AM Engine by providing a simple interface for creating iOS Passbook passes from content.

### Directory Structure
This is the example directory structure for a module.

	smartpass/
		index.html
		controllers.js
		components.js
		readme.md
		views/
			mobile.html
			module.html
			widget.html
		


## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/appmatrixinc/appmatrix.js/master/dist/appmatrix.min.js
[max]: https://raw.github.com/appmatrixinc/appmatrix.js/master/dist/appmatrix.js



In your main page:

```html
<script src="ame.js"></script>
<script src="dist/foo.min.js"></script>
<script>
jQuery(function($) {
  $.awesome(); // "awesome"
});
</script>
```



## Documentation
Here is a look at the package of the module object.


Standard npm packaging is used for checking for updates, and changes to module code, this is for the plugin manager.

	package: {
	    "name": "ame",
	    "version": "0.0.1",
	    "dependencies": {
	        "express": "3.x",
	        "mongodb": "1.1.x",
	        "mongoose": "3.3.x",
	        "restify": "1.4.x"
	    },
	    "repository": {
	        "type": "git",
	        "url": "git://github.com/appmatrixinc/ame-angular.git"
	    },
	    "author": {
	        "name": "Jonnie Spratley, AppMatrix",
	        "email": "jonnie@appmatrixinc.com",
	        "url": "http://blog.myappmatrix.com"
	    },
	    "devDependencies": {},
	    "scripts": {
	        "start": "node ./server.js;",
	        "test": "vows --spec --isolate",
	        "debug": "bbb debug",
	        "predeploy": "echo This will be run before deploying the app",
	        "postdeploy": "echo This will be run after deploying the app"
	    },
	    "main": "./lib/http-server",
	    "repository": {
	        "type": "git",
	        "url": "https://github.com/appmatrix/am-bb.git"
	    },
	    "keywords": ["cli", "http", "server"],
	    "license": "MIT",
	    "engines": {
	        "node": ">=0.6"
	    }
	}









## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_









