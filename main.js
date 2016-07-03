const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

require("electron-reload")(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 1280, height: 720, minWidth: 800, minHeight: 500});
  
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
} 
  app.on('ready', createWindow)
  
  app.on('window-all-closed', function () {
      app.quit();
  });


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.