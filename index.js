'use strict';
const app = require('app');
const BrowserWindow = require('browser-window');

// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();




function createMainWindow () {
	const win = new BrowserWindow({
		width: 600,
		height: 400,
		resizable: false
	});

	win.loadUrl(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}






function onClosed() {
	// deref the window
	// for multiple windows store them in an array
	mainWindow = null;
}




// prevent window being GC'd
let mainWindow;

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', function () {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});




app.on('ready', function () {
	mainWindow = createMainWindow();

	console.log('App ready');
		app.dock.setBadge('3');

});







// TODO: Some event listeners

app.on('browser-window-focus', function(e){
	console.log('browser-window-focus', e);
});

app.on('open-file', function(e){
	console.log('open-file', e);
});




// In main process.
var ipc = require('ipc');
ipc.on('asynchronous-message', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.sender.send('asynchronous-reply', 'pong');
});

ipc.on('synchronous-message', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.returnValue = 'pong';
});
