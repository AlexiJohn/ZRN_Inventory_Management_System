const electron = require('electron');
const url = require('url');
const path = require('path');
const mysql = require('mysql');

const {app, BrowserWindow, Menu, ipcMain} = electron;

var db = require('./database');
const { isBuffer } = require('util');

let mainWindow;

// Listen for app to be ready
app.on('ready', function(){
    //create new Window
    mainWindow = new BrowserWindow({
        
        // Allows Node modules to load in your views/html files
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }

    });
    // Load HTML into window
    mainWindow.maximize();

    mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../views/login.html'),
            protocol: 'file:',
            slashes: true
    }));
    
    //Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
});
