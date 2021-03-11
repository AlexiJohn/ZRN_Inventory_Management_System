const electron = require('electron');
const url = require('url');
const path = require('path');
const mysql = require('mysql');

const {app, BrowserWindow, Menu, ipcMain} = electron;

var db = require('./database');
const { isBuffer } = require('util');

let mainWindow;
let addBatch;
let mq_result;
let pq_result;

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

    // Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);

});



//Handle create Add window
function createaddProduct(){

    //create new Window
    addBatch = new BrowserWindow({
        width: 400,
        height: 800,
        title: "Add New Product",
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });
    // Load HTML into window
    addBatch.loadURL(url.format({
        pathname: path.join(__dirname, '../views/addBatch.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Garbage collection handle
    addBatch.on('close', function(){
        addBatch = null;
        reloadInventoryTables();
        getInventory();
    });
    
    getManufacturers();

}

function createaddBatch(){

    addBatch = new BrowserWindow({
        width: 400,
        height: 800,
        title: "Add New Batch",
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        }
    });

    addBatch.loadURL(url.format({
        pathname: path.join(__dirname, '../views/addNewBatch.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Garbage collection handle
    addBatch.on('close', function(){
        addNewBatch = null;
        reloadInventoryTables();
        getInventory();
    });

    getProduct();
    getManufacturers();
    
}

function reloadInventoryTables(){
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../views/InventoryMasterlist.html'),
        protocol: 'file:',
        slashes: true
    }));
}

// QUERIES //

function getManufacturers(){

    var manu_query = 'SELECT * FROM manufacturer ORDER BY manufacturer_name';
    db.query(manu_query, function(err,result){
        if (err) throw err;
        mq_result = result;

        addBatch.webContents.on('did-finish-load', function () {
            addBatch.webContents.send('batch:getManuList', mq_result);
        });
    });

}

function getProduct(){

    var prod_query = 'SELECT * FROM product ORDER BY product_name';

    db.query(prod_query, function(err,result){
        if (err) throw err;
        pq_result = result;

        addBatch.webContents.on('did-finish-load', function(){
            addBatch.webContents.send('batch:getProductList', pq_result);
        });
    });
}

function getInventory(){

    var product_batch_query = 'SELECT b.product_ID, p.product_name, SUM(b.quantity) AS quantity_sum FROM batch b, product p WHERE p.product_ID = b.product_ID GROUP BY b.product_ID ORDER BY p.product_name ASC'
    var product_batch_no_query = 'SELECT b.lot_no, b.product_ID, b.batch_no, b.quantity FROM batch b, product p, manufacturer m WHERE b.product_ID = p.product_ID AND m.manufacturer_ID = b.manufacturer_ID ORDER BY p.product_ID;'

    db.query(product_batch_query, function(err,result){
        if (err) throw err;
        
        mainWindow.webContents.on('did-finish-load', function(){
            mainWindow.webContents.send('inventory:getInventory:product', result);
        });

    
    });

    db.query(product_batch_no_query, function(err,result){
        if (err) throw err;

        mainWindow.webContents.on('did-finish-load', function(){
            mainWindow.webContents.send('inventory:getInventory:batch', result);
        });
    });

}


// LISTENERS //
ipcMain.on('batch:updateManuSelect',function(event,data){
    
    var product_query = 'SELECT manufacturer_ID FROM product WHERE product_ID = ?' 

    db.query(product_query, data, function(err,result){
        if (err) throw err;

        addBatch.webContents.send('batch:getManuSelect', result);
    });

});

ipcMain.on('login', function(){
    reloadInventoryTables();
    getInventory();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Add New Product",
                accelerator: 'CmdorCtrl+Shift+A',
                click(){
                    createaddProduct();
                }
            },
            {
                label: "Add New Batch",
                accelerator: 'CmdorCtrl+Shift+A',
                click(){
                    createaddBatch();
                }
            },
            {
                label: "Quit",
                accelerator: 'CmdOrCtrl+Q',
                click(){
                    app.quit()
                }
            },
        ]
    }
];

// if mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: 'CmdorCtrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}