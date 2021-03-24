const ipc = require('electron').ipcMain;
var { webContents } = require('electron');
var remote = require('electron').remote;
const window = require('electron').BrowserWindow;

const url = require('url');
const path = require('path');

const util = require('util');

var db = require('./database');

// BATCHES

ipc.on('batch:add', function(event,data){

    console.log('NEW MANU');

    var manu_query = 'INSERT INTO manufacturer (manufacturer_name) VALUES (?)';
    var manu_name = data[1];

    var prod_query = 'INSERT INTO product (product_name, manufacturer_ID) VALUES (?)';
    
    var prod_name = [data[0]];

    var prod_id;
    var manu_id;

    // INSERT Query for manufacturer
    db.query(manu_query, manu_name, function(err,result){
        if (err) throw err;
        console.log("MANUFACTURER: Number of records inserted: " + result.affectedRows);
    });

    db.query('SELECT LAST_INSERT_ID() AS primaryID', function(err,result){

        if (err) throw err;
        manu_id = result[0].primaryID;
        console.log(manu_id);
        
        prod_name.push(manu_id);
        prod_name = [prod_name];
        console.log(prod_name);

        product();
    });


    function product(){

        // INSERT Query for product
        db.query(prod_query, prod_name, function(err,result){
            if (err) throw err;
            console.log("PRODUCT: Number of records inserted: " + result.affectedRows);
        });
        
        db.query('SELECT LAST_INSERT_ID() AS primaryID', function(err,result){
            if (err) throw err;
            prod_id = result[0].primaryID;
            console.log("PRODUCT: "+ prod_id);
            batch();
        });  

    }
    
    
    //Makes sure this runs after the two queries
    function batch(){
        // SELECT Query for last inserted product and batch
        var batch_query = "INSERT INTO batch (product_ID, manufacturer_ID, batch_no, delivery_date, expiration_Date, quantity, unit_price, threshold) VALUES (?)";
        
        data.splice(0, 2, prod_id, manu_id);
        
        var batch_data = [data];

        // INSERT Query for batch
        db.query(batch_query, batch_data, function(err,result){
            if (err) throw err;
            console.log("BATCH: Number of records inserted: " + result.affectedRows);

            getInventory();
            getManufacturers();
            getProduct();
        });
    }

    
});

ipc.on('batch:existingManu', function(event,data){

    console.log('EXISTING MANU');
    var prod_query = 'INSERT INTO product (product_name, manufacturer_ID) VALUES (?)';
    var prod_name = [[data[0], data[1]]];
    console.log(prod_name);

    var prod_id;

    // INSERT Query for product
    db.query(prod_query, prod_name, function(err,result){
        if (err) throw err;
        console.log("PRODUCT: Number of records inserted: " + result.affectedRows);
    });
    
    db.query('SELECT LAST_INSERT_ID() AS primaryID', function(err,result){
        if (err) throw err;
        prod_id = result[0].primaryID;
        console.log(prod_id);
        batch();
    });

    //Makes sure this runs after the two queries
    function batch(){
        // SELECT Query for last inserted product and batch
        var batch_query = "INSERT INTO batch (product_ID, manufacturer_ID, batch_no, delivery_date, expiration_Date, quantity, unit_price, threshold) VALUES (?)";
        
        data.splice(0, 1, prod_id);
        
        var batch_data = [data];

        // INSERT Query for batch
        db.query(batch_query, batch_data, function(err,result){

            if (err) throw err;

            console.log("BATCH: Number of records inserted: " + result.affectedRows);
            
            getInventory();
            getManufacturers();
            getProduct();

        });
    }

    
});

ipc.on('batch:addNewBatch', function(event,data){

    batch();

    var current_window = window.getFocusedWindow();

    function batch(){
        // SELECT Query for last inserted product and batch
        var batch_query = "INSERT INTO batch (product_ID, manufacturer_ID, batch_no, delivery_date, expiration_Date, quantity, unit_price, threshold) VALUES (?)";
        
        var batch_data = [data];

        // INSERT Query for batch
        db.query(batch_query, batch_data, function(err,result){
            if (err) throw err;
            console.log("BATCH: Number of records inserted: " + result.affectedRows);

            getInventory();
            getManufacturers();
            getProduct();
        });
    }

    

});

ipc.on('batch:updateManuSelect',function(event,data){

    var current_window = window.getFocusedWindow();
    
    var product_query = 'SELECT manufacturer_ID FROM product WHERE product_ID = ?' 

    db.query(product_query, data, function(err,result){
        if (err) throw err;

        current_window.webContents.send('batch:getManuSelect', result);

        getInventory();
        getManufacturers();
        getProduct();
    });
});

//BATCHES DETAILS

ipc.on('inventory:viewBatch', function(event,data){

    var batch_query = 'SELECT * FROM batch WHERE lot_no = ?';
    var product_query = 'SELECT * from product WHERE product_ID = ?';
    var manufacturer_query = 'SELECT * FROM manufacturer WHERE manufacturer_ID = ?';
    var lot_no = data;
    var current_window = window.getFocusedWindow();
    
    var batch_data;
    var prod_data;
    var manu_data;
    var get_data;

    current_window.loadFile('views/inventoryDetails.html');

    db.query(batch_query, lot_no, function(err,result){

        if (err) throw err;
        batch_data = result[0];
        p_query();
    });

    function p_query(){
        db.query(product_query, batch_data.product_ID, function(err, result){

            if (err) throw err;
            prod_data = result;
            m_query();
            
        });
    }

    function m_query(){
        
        db.query(manufacturer_query, batch_data.manufacturer_ID, function(err, result){
            
            if (err) throw err;
            manu_data = result;
            get_data = [batch_data,prod_data,manu_data];

            current_window.webContents.on('did-finish-load', function(){
                current_window.webContents.send('inventory:receiveBatch', get_data);

            if (current_window.webContents.isLoading() == false){
                current_window.webContents.send('inventory:receiveBatch', get_data);
            }
            });
        });
    }

    
});

ipc.on('inventory:updateBatch', function(event,data){

    var current_window = window.getFocusedWindow();
    var update_data = data;

    var batch_query = "UPDATE batch SET batch_no = ?, delivery_date = ?, expiration_Date = ?, quantity = ?, unit_price = ?, threshold = ? WHERE lot_no = ?";

    db.query(batch_query, data, function(err,result){
        if (err) throw err;

        current_window.webContents.on('did-finish-load', function(){
            current_window.webContents.send('inventory:detailsReload', update_data);
        });

        if (current_window.webContents.isLoading() == false){
            current_window.webContents.send('inventory:detailsReload', update_data);
        }

        
    });
    
});
//LOGIN

ipc.on('login', function(event,data){

    var current_window = window.getFocusedWindow();

    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/inventoryMasterlist.html'),
        protocol: 'file:',
        slashes: true
    }));

    getInventory();

    getManufacturers();
    getProduct();

});

// GET AND RELOAD INVENTORY MASTER LIST

function getInventory(){

    var product_batch_query = 'SELECT b.product_ID, p.product_name, SUM(b.quantity) AS quantity_sum FROM batch b, product p WHERE p.product_ID = b.product_ID GROUP BY b.product_ID ORDER BY p.product_name ASC'
    var product_batch_no_query = 'SELECT b.lot_no, b.product_ID, b.batch_no, b.quantity FROM batch b, product p, manufacturer m WHERE b.product_ID = p.product_ID AND m.manufacturer_ID = b.manufacturer_ID ORDER BY p.product_ID;'

    var current_window = window.getFocusedWindow();

    db.query(product_batch_query, function(err,result){
        if (err) throw err;
        
        current_window.webContents.once('did-finish-load', function(){
            current_window.webContents.send('inventory:getInventory:product', result);
        });

        if (current_window.webContents.isLoading() == false){
            current_window.webContents.send('inventory:getInventory:product', result);
        }

    });

    db.query(product_batch_no_query, function(err,result){
        if (err) throw err;

        current_window.webContents.once('did-finish-load', function(){
            current_window.webContents.send('inventory:getInventory:batch', result);
        });

        if (current_window.webContents.isLoading() == false){
            current_window.webContents.send('inventory:getInventory:batch', result);
        }
    });

}

function getManufacturers(){

    var manu_query = 'SELECT * FROM manufacturer ORDER BY manufacturer_name';
    var current_window = window.getFocusedWindow();

    db.query(manu_query, function(err,result){
        if (err) throw err;
        mq_result = result;

        current_window.webContents.on('did-finish-load', function () {
            current_window.webContents.send('batch:getManuList', mq_result);
        });
    });

}

function getProduct(){

    var prod_query = 'SELECT * FROM product ORDER BY product_name';
    var current_window = window.getFocusedWindow();

    db.query(prod_query, function(err,result){
        if (err) throw err;
        pq_result = result;

        current_window.webContents.on('did-finish-load', function(){
            current_window.webContents.send('batch:getProductList', pq_result);
        });
    });
}

// GLOBAL

ipc.on('go-back', function(event,data){

    var current_window = window.getFocusedWindow();

    current_window.webContents.goBack();

});
