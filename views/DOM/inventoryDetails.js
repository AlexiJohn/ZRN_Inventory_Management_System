const electron = require('electron');
const ipc = electron.ipcRenderer;
const thiswindow = require('electron').BrowserWindow;
const moment = require('moment');


const $ = require( "jquery" );
const materialize = require('materialize-css');

var get_data;
var batch_data;
var prod_name;
var manu_name;
var send_batch_data;


$('#back_button').on('click', function(){

    ipc.send('go-back','data');
    ipc.send('login','data');

});

$('#btn_edit').on('click', function(){

    autoFillModal(get_data);

});

$('#addBatch').on('click', function(){

    var batch_no = $('#batch_no').val(); 
    console.log(batch_no)
    var delivery_date = $('#delivery_Date').val();
    var expiration_date = $('#expiration_Date').val();
    var unit_price = $('#quantity').val();
    var quantity = $('#unit_price').val();
    var threshold = $('#threshold').val();

    var lot_no = batch_data.lot_no;
    send_batch_data = [batch_no, delivery_date, expiration_date, quantity, unit_price, threshold, lot_no];

    ipc.send('inventory:updateBatch', send_batch_data);

});

ipc.on('inventory:receiveBatch', function(event, data){

    get_data = data;

    batch_data = data[0];
    prod_name = data[1][0].product_name;
    manu_name = data[2][0].manufacturer_name;

    var product = $('#id_product');
    var manufacturer = $('#id_manufacturer');
    var batch_no = $('#id_batch_no');
    var delivery_date = $('#id_delivery_date');
    var expiration_date = $('#id_expiration_date');
    var unit_price = $('#id_unit_price');
    var quantity = $('#id_quantity');
    var threshold = $('#id_threshold');
    
    var deliv = moment(batch_data.delivery_date, "ddd MMM DD YYYY HH:mm:ss");
    var exp = moment(batch_data.expiration_Date, "ddd MMM DD YYYY HH:mm:ss");
    var format_deliv = deliv.format('MMM DD, YYYY');
    var format_exp = exp.format('MMM DD, YYYY');

    product.text(prod_name);
    manufacturer.text(manu_name);
    batch_no.text(batch_data.batch_no);
    delivery_date.text(format_deliv);
    expiration_date.text(format_exp);
    unit_price.text(batch_data.unit_price);
    quantity.text(batch_data.quantity);
    threshold.text(batch_data.threshold);

});

ipc.on('inventory:detailsReload', function(event,data){

    console.log(data);
    
    var batch_no = $('#id_batch_no');
    var delivery_date = $('#id_delivery_date');
    var expiration_date = $('#id_expiration_date');
    var unit_price = $('#id_unit_price');
    var quantity = $('#id_quantity');
    var threshold = $('#id_threshold');

    var deliv = moment(data[1], "ddd MMM DD YYYY HH:mm:ss");
    var exp = moment(data[2], "ddd MMM DD YYYY HH:mm:ss");
    var format_deliv = deliv.format('MMM DD, YYYY');
    var format_exp = exp.format('MMM DD, YYYY');

    batch_no.text(data[0]);
    delivery_date.text(format_deliv);
    expiration_date.text(format_exp);
    unit_price.text(data[3]);
    quantity.text(data[4]);
    threshold.text(data[5]);

});

function autoFillModal(fields){
    
    
    fields_batch_data = fields[0];
    fields_prod_name = fields[1][0].product_name;
    fields_manu_name = fields[2][0].manufacturer_name;


    var deliv = moment(fields_batch_data.delivery_date, "ddd MMM DD YYYY HH:mm:ss");
    var exp = moment(fields_batch_data.expiration_Date, "ddd MMM DD YYYY HH:mm:ss");
    var format_deliv = deliv.format('YYYY-MM-DD');
    var format_exp = exp.format('YYYY-MM-DD');


    $('#product_name').val(fields_prod_name);
    $('#batch_no').val(fields_batch_data.batch_no);
    $('#manufacturer_name').val(fields_manu_name);
    $('#delivery_Date').val(format_deliv);
    $('#expiration_Date').val(format_exp);
    $('#quantity').val(fields_batch_data.quantity);
    $('#unit_price').val(fields_batch_data.unit_price);
    $('#threshold').val(fields_batch_data.threshold);

    $('#product_name').data('value',fields[1][0].product_ID);
    $('#manufacturer_name').data('value',fields[2][0].manufacturer_ID);


    M.updateTextFields();
}


