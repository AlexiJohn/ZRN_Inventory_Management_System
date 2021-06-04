const ipc = require('electron').ipcMain;
var { webContents } = require('electron');
var remote = require('electron').remote;

const window = require('electron').BrowserWindow;

const url = require('url');
const path = require('path');

const util = require('util');

const moment = require('moment');

var db = require('./database');
var async_db = require('./async_database');
var now = moment().format('YYYY-MM-DD');

// functions

async function getDateTime(){
    
    Date.prototype.today = function () { 
        return this.getFullYear() + "-" + ((this.getDate() < 10)?"0":"") + this.getDate() + "-" + (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1);
    }
    
    // For the time now
    Date.prototype.timeNow = function () {
         return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    }

    // var datetime = new Date().today() + " " + new Date().timeNow();
    var datetime = new Date().today();
    
    return datetime;
}

// MASTER QUERIES // THESE ARE NEW ONES, MUCH BETTER SINCE THEY'RE ASYNC FUNCTIONS

async function masterQuery_Product(){
    
    var master_product = 'SELECT * FROM product ORDER BY product_name';

    var master_product_result = await async_db.query(master_product);

    return master_product_result;
}

async function masterQuery_Batch(){

    var master_batch = 'SELECT * FROM batch';

    var master_batch_result = await async_db.query(master_batch);

    return master_batch_result;

}

async function masterQuery_CDR(){

    var master_CDR = 'SELECT * FROM client_delivery_receipt ORDER BY CDR_no DESC';

    var master_CDR_result = await async_db.query(master_CDR);

    return master_CDR_result;
}

async function masterInsert_CDR(values){
    
    // WITH COMPLETION DATE
    // var masterInsert_CDR = `INSERT INTO client_delivery_receipt(CDR_no, sales_invoice_no, total, first_name, middle_initial, last_name, suffix, client_address, completion_date, payment_option, payment_duedate, delivery_date, ordered_date, delivery_fee, booked_by) VALUES (?)`;

    var masterInsert_CDR = `INSERT INTO client_delivery_receipt(CDR_no, sales_invoice_no, total, first_name, middle_initial, last_name, suffix, client_address,  payment_option, payment_duedate, delivery_date, ordered_date, delivery_fee, booked_by) VALUES (?)`;

    var masterInsert_CDR_values = [values];

    var masterInsert_CDR_result = await async_db.insert(masterInsert_CDR, masterInsert_CDR_values);

    return masterInsert_CDR_result;
}

async function masterUpdate_CDR(values, pk){
    
    console.log(values);
    if (values[8] == ''){
        var query = `UPDATE client_delivery_receipt SET CDR_no=${values[0]}, sales_invoice_no=${values[1]}, total=${values[2]}, first_name='${values[3]}', middle_initial='${values[4]}', last_name='${values[5]}', suffix='${values[6]}', client_address='${values[7]}', payment_option='${values[9]}', payment_duedate='${values[10]}', delivery_date='${values[11]}', ordered_date='${values[12]}', delivery_fee=${values[13]}, booked_by='${values[14]}' WHERE CDR_no = ${pk}`;
        
        console.log(query);
    }
    else {
        var query = `UPDATE client_delivery_receipt SET CDR_no=${values[0]}, sales_invoice_no=${values[1]}, total=${values[2]}, first_name='${values[3]}', middle_initial='${values[4]}', last_name='${values[5]}', suffix='${values[6]}', client_address='${values[7]}', completion_date='${values[8]}', payment_option='${values[9]}', payment_duedate='${values[10]}', delivery_date='${values[11]}', ordered_date='${values[12]}', delivery_fee=${values[13]}, booked_by='${values[14]}' WHERE CDR_no = ${pk}`;
        
        console.log(query);
    }

    var masterUpdate_CDR = await async_db.update(query);

    return masterUpdate_CDR;
}

async function masterQuery_product_ordered(values){

    var query = 'SELECT * FROM product_ordered WHERE CDR_no = ? ORDER BY item_no ASC'

    var masterQuery_product_ordered_result = await async_db.insert(query, values);

    return masterQuery_product_ordered_result;
}

async function masterInsert_product_ordered(values){

    var masterInsert_product_ordered = `INSERT INTO product_ordered(CDR_no, product_name, batch_no, item_no, quantity, subtotal, discount) VALUES (?)`;
    for (i = 0; i < values.length; i++){
        var masterInsert_product_ordered_result = await async_db.insert(masterInsert_product_ordered, [values[i]]);
    }
    return masterInsert_product_ordered_result;
}

async function masterUpdate_product_ordered(values, pk){

    var delete_query = `DELETE FROM product_ordered WHERE CDR_no = ${pk}`;

    var delete_result = await async_db.delete(delete_query);

    var masterUPDATE_product_ordered = `INSERT INTO product_ordered(CDR_no, product_name, batch_no, item_no, quantity, subtotal, discount) VALUES (?)`;

    for (i = 0; i < values.length; i++){
        var masterUPDATE_product_ordered_result = await async_db.insert(masterUPDATE_product_ordered, [values[i]]);
    }

    return masterUPDATE_product_ordered_result;

}

async function masterQuery_notification(){
    var query = `SELECT * FROM notifications ORDER BY notification_ID DESC`;

    var query_result = await async_db.query(query);

    return query_result;
}

async function masterInsert_notification(lot_no, descript, notification_type){

    var n_lot_no = lot_no;
    var n_read_status = 0;
    var timestamp = await getDateTime();
    var insert = `INSERT INTO notifications(lot_no, descript, timestmp, read_status, notification_type) VALUES (?)`;

    var values = [n_lot_no, descript, timestamp, n_read_status, notification_type]
    var insert_result = await async_db.insert(insert,[values]);

    return insert_result;
}

async function masterInsert_adjustment(descript, type){
    var query = `INSERT INTO adjustment(descript, adjustment_type) VALUES ('${descript}','${type}')`;

    var query_result = await async_db.insert(query);

    return query_result;
}

async function masterUpdate_notification(){
    var query = `UPDATE notifications SET read_status = 1;`

    var query_result = await async_db.update(query);

    return query_result
}
//SPECIFIC QUERIES FOR CERTAIN PAGES

async function get_CDR(values){

    var get_CDR = 'SELECT * FROM client_delivery_receipt WHERE CDR_no = ?';

    var get_CDR_result = await async_db.query(get_CDR,values);

    return get_CDR_result;
    
}

async function set_CDR_completed(values){
    var query = `UPDATE client_delivery_receipt SET completed=1 WHERE CDR_no = ${values}`;

    var query_result = await async_db.update(query);

    return query_result;
}
async function get_BATCH(product_id, number){

    var query = `SELECT * FROM batch WHERE (product_id = ${product_id}) AND (batch_no = '${number}')`;

    var query_result = await async_db.query(query);

    return query_result;

}

async function get_PRODUCT(values){

    var query = `SELECT * FROM product WHERE product_name = ?`

    var query_result = await async_db.query(query,values);

    return query_result;
}

async function update_BATCH_bySALE(quantity, pk){
    var query = `UPDATE batch SET quantity = ${quantity} WHERE lot_no = ${pk}`;

    var query_result = await async_db.update(query);

    return query_result;
}

async function update_BATCH_bySTATUS(status, pk){
    var query = `UPDATE batch SET status='${status}' WHERE lot_no = ${pk}`;

    var query_result = await async_db.update(query);

    return query_result;
}

async function get_adjustment_byDATE(date1,date2){
    var query = `SELECT * FROM adjustment WHERE timestmp >= '${date1}' AND timestmp <= '${date2}' ORDER BY timestmp DESC`;

    var query_result = await async_db.update(query);

    return query_result;
}

async function get_unreadnotifs(){
    var query = `SELECT COUNT(notification_ID) as unread FROM notifications WHERE read_status = 0`;

    var query_result = await async_db.update(query);

    return query_result;
}
// DASHBOARD

async function get_PENDINGORDERS(){
    var query = `SELECT CDR.delivery_date, CDR.first_name, CDR.last_name, CDR.CDR_no, SUM(PO.quantity) as quantity, CDR.total FROM client_delivery_receipt as CDR LEFT JOIN product_ordered as PO ON PO.CDR_no = CDR.CDR_no WHERE CDR.completion_date IS NULL GROUP BY CDR.CDR_no;`;

    var query_result = await async_db.query(query);
    
    return query_result;
}

async function get_COMPLETEDORDERS_byDate(date1, date2){
    var query = `SELECT COUNT(CDR_no) as CDR_no FROM client_delivery_receipt WHERE completion_date >= '${date1}' AND completion_date <= '${date2}'`;

    var query_result = await async_db.query(query);
    
    return query_result;
}

async function get_PENDINGDORDERS_byDate(date1, date2){
    var query = `SELECT COUNT(CDR_no) as CDR_no FROM client_delivery_receipt WHERE completion_date IS NULL`;

    var query_result = await async_db.query(query);
    
    return query_result;
}

async function get_TOTALORDERS_byDate(date1, date2){
    var query = `SELECT SUM(total) as total FROM client_delivery_receipt WHERE ordered_date >= '${date1}' AND ordered_date <= '${date2}'`;

    var query_result = await async_db.query(query);
    
    return query_result;
}

async function get_TOPPERFORMING_byDate(date1, date2){
    var query = `SELECT PO.product_name, b.expiration_Date, b.unit_price, SUM(PO.quantity) as quantity
    FROM product_ordered as PO
    LEFT JOIN client_delivery_receipt as CDR
    ON PO.CDR_no = CDR.CDR_no
    LEFT JOIN batch as b
    ON b.batch_no = PO.batch_no
    WHERE ordered_date >= '${date1}' AND ordered_date <= '${date2}'
    GROUP BY b.batch_no
    ORDER BY quantity DESC;`;

    var query_result = await async_db.query(query);
    
    return query_result;
}

async function update_BATCH_STATUS2(status, lot_no){
    var query = `UPDATE batch SET status2 = "${status}" WHERE lot_no = ${lot_no};`;

    var query_result = await async_db.update(query);
    
    return query_result;
}

// NOTIFICATIONS

async function checkExpiry(batches){
    for (i in batches){
        if (batches[i].status != "expired"){
            var batch_date = batches[i].expiration_Date;

            var moment_current = moment();

            var moment_batch = moment(batch_date, "ddd MMM DD YYYY HH:mm:ss");

            var months = moment_batch.diff(moment_current,'months');
            var days = moment_batch.diff(moment_current, "days");

            if ( days <= 0 && batches[i].status == "expiring"){
                var check_lot_no = batches[i].lot_no;
                var check_descript = "Expired Stock";
                var check_notif_type = "expiring";
                var update_batch_status = "expired";
                var update_batch = await update_BATCH_bySTATUS(update_batch_status, check_lot_no);
                var insert_notif = await masterInsert_notification(check_lot_no, check_descript, check_notif_type);
            } else if( months < 6 && batches[i].status == "good"){
                var check_lot_no = batches[i].lot_no;
                var check_descript = "Stock will Expire";
                var check_notif_type = "expiring";
                var update_batch_status = "expiring";
                var update_batch = await update_BATCH_bySTATUS(update_batch_status, check_lot_no);
                var insert_notif = await masterInsert_notification(check_lot_no, check_descript, check_notif_type);
            } 
            // else {
            //     var check_lot_no = batches[i].lot_no;
            //     var check_descript = "Expired Stock";
            //     var check_notif_type = "expiring";
            //     var update_batch_status = "good";
            //     var update_batch = await update_BATCH_bySTATUS(update_batch_status, check_lot_no);
            // }
        }    
    }

    return true;
}

//HISTORY

ipc.on('history:range', async function(event,data){
    var adjustments = await get_adjustment_byDATE(data[0],data[1])

    var current_window = window.getFocusedWindow(); 

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('history:onload', adjustments);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('history:onload', adjustments);
    }
})
// GENERATE REPORTS

ipc.on('dashboard:generateReport', async function(event,data){
    var current_window = window.getFocusedWindow();

    var pending_orders = await get_PENDINGORDERS();
    var total_pending = await get_PENDINGDORDERS_byDate(data[0],data[1]);
    var total_completed = await get_COMPLETEDORDERS_byDate(data[0],data[1]);
    var total_ordered = await get_TOTALORDERS_byDate(data[0],data[1]);
    var top_performing = await get_TOPPERFORMING_byDate(data[0],data[1]);

    var results = {
        pending: pending_orders,
        total_pending: total_pending,
        total_completed: total_completed,
        total_ordered: total_ordered,
        top_performing: top_performing
    };

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('dashboard:onload', results);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('dashboard:onload', results);
    }

});

// BATCHES

ipc.on('batch:add', function(event,data){

    console.log('NEW MANU');

    var manu_query = 'INSERT INTO manufacturer (manufacturer_name) VALUES (?)';
    var manu_name = [data[1]];

    var prod_query = 'INSERT INTO product (product_name, manufacturer_ID) VALUES (?)';
    
    var prod_name = [data[0]];

    var prod_id;
    var manu_id;

    // INSERT Query for manufacturer
    db.query(manu_query, manu_name, function(err,result){
        // if (err) throw err;
        console.log("MANUFACTURER: Number of records inserted: " + result.affectedRows);
        manu();
    });

    function manu(){
        db.query('SELECT LAST_INSERT_ID() AS primaryID', function(err,result){

            // if (err) throw err;
            manu_id = result[0].primaryID;
            console.log(manu_id);
            
            prod_name.push(manu_id);
            prod_name = [prod_name];
            console.log(prod_name);
    
            product();
        });
    }

    function product(){

        // INSERT Query for product
        db.query(prod_query, prod_name, function(err,result){
            // if (err) throw err;
            console.log("PRODUCT: Number of records inserted: " + result.affectedRows);
        });
        
        db.query('SELECT LAST_INSERT_ID() AS primaryID', function(err,result){
            // if (err) throw err;
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
        prod
    });
    
    function prod(){
        db.query('SELECT LAST_INSERT_ID() AS primaryID', function(err,result){
            if (err) throw err;
            prod_id = result[0].primaryID;
            console.log(prod_id);
            batch();
        });
    }
    

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

ipc.on('inventory:updateBatch', async function(event,data){

    var current_window = window.getFocusedWindow();
    var update_data = data;

    var descript = "Lot No: " + data[6];
    var type = "inventory"
    var insert_adjustment = await masterInsert_adjustment(descript,type);

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

//BATCH FUNCTIONS

async function updateBatchFromSale(values){
    //ACCEPTS LIST OF LIST OF BATCH DETAILS FROM SALE
    for (i in values){
        var data = values[i];

        var product_name = values[i][1];
        var batch_no = values[i][2];
        var row_quantity = values[i][4];

        var query_product_name = await get_PRODUCT(product_name);

        var query_batch_details = await get_BATCH(query_product_name[0].product_ID, batch_no);

        var new_quantity = query_batch_details[0].quantity - row_quantity;

        var update_batch_quantity = await update_BATCH_bySALE(new_quantity, query_batch_details[0].lot_no);
        console.log(update_batch_quantity);
    }
    return true;
}

async function checkForThreshold(batches){
    console.log("it ran")
    for (i in batches){
        var data = batches[i];

        var product_name = batches[i][1];
        var batch_no = batches[i][2];

        var query_product_name = await get_PRODUCT(product_name);

        var query_batch_details = await get_BATCH(query_product_name[0].product_ID, batch_no);

        if (query_batch_details[0].quantity == 0){
            console.log("Out of Stock")
            var lot_no = query_batch_details[0].lot_no
            var update_batch_status = await update_BATCH_STATUS2("out_of_stock",lot_no);
            var check_descript = "Out of Stock";
            var check_notif_type = "stock";
            var insert_notif = await masterInsert_notification(lot_no, check_descript, check_notif_type);
        }
        else if (query_batch_details[0].threshold >= query_batch_details[0].quantity){
            console.log("Low Stock")
            var lot_no = query_batch_details[0].lot_no
            var update_batch_status = await update_BATCH_STATUS2("low_stock", lot_no);
            var check_descript = "Low Stock";
            var check_notif_type = "stock";
            var insert_notif = await masterInsert_notification(lot_no, check_descript, check_notif_type);
        }
        else{
            console.log("Good")
            var lot_no = query_batch_details[0].lot_no
            var update_batch_status = await update_BATCH_STATUS2("good", lot_no);
        }
    }
    return true;
}

//LOGIN

ipc.on('login', async function(event,data){

    var week_before = moment().subtract(7,'days').format('YYYY-MM-DD')

    var current_window = window.getFocusedWindow();

    var pending_orders = await get_PENDINGORDERS();
    var total_pending = await get_PENDINGDORDERS_byDate(week_before,now);
    var total_completed = await get_COMPLETEDORDERS_byDate(week_before,now);
    var total_ordered = await get_TOTALORDERS_byDate(week_before,now);
    var top_performing = await get_TOPPERFORMING_byDate(week_before,now);

    var batches = await masterQuery_Batch();
    var checked = await checkExpiry(batches);

    var results = {
        pending: pending_orders,
        total_pending: total_pending,
        total_completed: total_completed,
        total_ordered: total_ordered,
        top_performing: top_performing
    };

    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/dashboard.html'),
        protocol: 'file:',
        slashes: true
    }));

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('dashboard:onload', results);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('dashboard:onload', results);
    }

    var notifs = await unread_navbar()
});

// GET AND RELOAD INVENTORY MASTER LIST

async function getInventory(){

    var product_batch_query = 'SELECT b.product_ID, p.product_name, SUM(b.quantity) AS quantity_sum FROM batch b, product p WHERE p.product_ID = b.product_ID GROUP BY b.product_ID ORDER BY p.product_name ASC'
    var product_batch_no_query = 'SELECT b.lot_no, b.product_ID, b.batch_no, b.quantity, b.status, b.status2 FROM batch b, product p, manufacturer m WHERE b.product_ID = p.product_ID AND m.manufacturer_ID = b.manufacturer_ID ORDER BY p.product_ID;'

    var current_window = window.getFocusedWindow();

    var products = await masterQuery_Product();
    var batches = await masterQuery_Batch();

    var results = {
        products: products,
        batches: batches
    }

    


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

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('inventory:icons', results);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('inventory:icons', results);
    }
}

function getManufacturers(){

    var manu_query = 'SELECT * FROM manufacturer ORDER BY manufacturer_name';
    var current_window = window.getFocusedWindow();

    db.query(manu_query, function(err,result){
        if (err) throw err;
        mq_result = result;

        current_window.webContents.once('did-finish-load', function () {
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

        current_window.webContents.once('did-finish-load', function(){
            current_window.webContents.send('batch:getProductList', pq_result);
        });
    });
}


// SALES

ipc.on('sales:loadAddNewSale', function(event,data){

    var current_window = window.getFocusedWindow();
    
    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/salesAddNew.html'),
        protocol: 'file:',
        slashes: true
    }));

});

ipc.on('sales:loadAddNewSale:sendData', async function(event,data){

    var current_window = window.getFocusedWindow();

    var product_result = await masterQuery_Product();
    var batch_result = await masterQuery_Batch();

    var result = [product_result,batch_result];

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('sales:loadAddNewSale:redirect', result);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('sales:loadAddNewSale:redirect', result);
    }

});

ipc.on('sales:createNewSale', async function(event,data){

    var sale_result = await masterInsert_CDR(data[0]);
    var product_ordered_result = await masterInsert_product_ordered(data[1]);

    loadSalesMasterlist();

});

ipc.on('sales:loadEditPage', async function(event,data){

    var current_window = window.getFocusedWindow();

    var PRODUCT_result = await masterQuery_Product();
    var BATCH_result = await masterQuery_Batch();
    
    var CDR_result = await get_CDR(data);
    var PO_result = await masterQuery_product_ordered(data);
    var result = [ PRODUCT_result, BATCH_result, CDR_result, PO_result ];


    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/salesEdit.html'),
        protocol: 'file:',
        slashes: true
    }));

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('sales:loadEditPage:redirect', result);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('sales:loadEditPage:redirect', result);
    }
});

ipc.on('sales:loadViewPage', async function(event,data){

    
    var current_window = window.getFocusedWindow();

    var PRODUCT_result = await masterQuery_Product();
    var BATCH_result = await masterQuery_Batch();
    
    var CDR_result = await get_CDR(data);
    var PO_result = await masterQuery_product_ordered(data);
    var result = [ PRODUCT_result, BATCH_result, CDR_result, PO_result ];

    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/salesView.html'),
        protocol: 'file:',
        slashes: true
    }));

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('sales:loadViewPage:redirect', result);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('sales:loadViewPage:redirect', result);
    }

});

ipc.on('sales:UpdateSale', async function(event,data){

    var current_CDR = data[2];
    var update_CDR = await masterUpdate_CDR(data[0], current_CDR);
    var update_PO = await masterUpdate_product_ordered(data[1], current_CDR);
    
    var CDR = await get_CDR(current_CDR);

    var descript = "CDR No.: " + data[0][0];
    var type = "sales";
    var insert_adjustment = await masterInsert_adjustment(descript,type);
    console.log(CDR[0].completion_date != null)

    if (CDR[0].completed == 0 && CDR[0].completion_date != null){
        var update_BATCH = await updateBatchFromSale(data[1]);
        var set_CDR = await set_CDR_completed(data[2]);
        var checked_threshold = await checkForThreshold(data[1]);
    }
    
    
    loadSalesMasterlist();

});

async function loadSalesMasterlist(){

    var current_window = window.getFocusedWindow();

    var result = await masterQuery_CDR();

    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/salesMasterlist.html'),
        protocol: 'file:',
        slashes: true
    }));  

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('sales:loadMasterlist:FrontEnd', result);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('sales:loadMasterlist:FrontEnd', result);
    }

    var notifs = await unread_navbar()
}

// GLOBAL

ipc.on('go-back', function(event,data){
    
    var current_window = window.getFocusedWindow();

    current_window.webContents.goBack();

});

ipc.on('nav:inventory', async function(event,data){

    var current_window = window.getFocusedWindow();

    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/inventoryMasterlist.html'),
        protocol: 'file:',
        slashes: true
    }));

    getInventory();
    getManufacturers();
    getProduct();

    var notifs = await unread_navbar()
});

ipc.on('nav:sales', async function(event,data){

    var current_window = window.getFocusedWindow();

    loadSalesMasterlist();

    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/salesMasterlist.html'),
        protocol: 'file:',
        slashes: true
    }));

    var notifs = await unread_navbar()
});

ipc.on('nav:dashboard', async function(event,data){

    var week_before = moment().subtract(7,'days').format('YYYY-MM-DD')
    
    var current_window = window.getFocusedWindow();

    var pending_orders = await get_PENDINGORDERS();
    var total_pending = await get_PENDINGDORDERS_byDate(week_before,now);
    var total_completed = await get_COMPLETEDORDERS_byDate(week_before,now);
    var total_ordered = await get_TOTALORDERS_byDate(week_before,now);
    var top_performing = await get_TOPPERFORMING_byDate(week_before,now);

    var batches = await masterQuery_Batch();
    var checked = await checkExpiry(batches);

    var results = {
        pending: pending_orders,
        total_pending: total_pending,
        total_completed: total_completed,
        total_ordered: total_ordered,
        top_performing: top_performing
    };

    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/dashboard.html'),
        protocol: 'file:',
        slashes: true
    }));

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('dashboard:onload', results);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('dashboard:onload', results);
    }

    var notifs = await unread_navbar()
});

ipc.on('nav:notifs', async function(event,data){

    var current_window = window.getFocusedWindow(); 

    var notifs = await masterQuery_notification();
    var batches = await masterQuery_Batch();
    var products = await masterQuery_Product();

    var results = [notifs, batches, products];

    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/notifications.html'),
        protocol: 'file:',
        slashes: true
    }));

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('notify:getNotifs', results);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('notify:getNotifs', results);
    }

    var read_notifs = await masterUpdate_notification()
    var notifs = await unread_navbar()
});

ipc.on('nav:history', async function(event,data){

    
    var week_before = moment().subtract(7,'days').format('YYYY-MM-DD')
    var week_after = moment().add(7,'days').format('YYYY-MM-DD');
    var adjustments = await get_adjustment_byDATE(week_before, week_after);

    var current_window = window.getFocusedWindow(); 
    current_window.loadURL(url.format({
        pathname: path.join(__dirname, '../views/history.html'),
        protocol: 'file:',
        slashes: true
    }));

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('history:onload', adjustments);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('history:onload', adjustments);
    }

    var notifs = await unread_navbar()
});

async function unread_navbar(){

    var current_window = window.getFocusedWindow(); 

    var count_unread = await get_unreadnotifs();

    current_window.webContents.once('did-finish-load', function(){
        current_window.webContents.send('notifs:navbar', count_unread);
    });

    if (current_window.webContents.isLoading() == false){
        current_window.webContents.send('notifs:navbar', count_unread);
    }

}