const electron = require('electron');
const ipc = electron.ipcRenderer;
const moment = require('moment');

const $ = require( "jquery" );

var x = 0;
var products;
var batches;
var tablefill;
var products_total = 0;

ipc.on('sales:loadAddNewSale:redirect', function(event,data){

    products = data[0];
    batches = data[1];

    
    populateProductOptions(products);

});


// FUNCTIONS

function populateProductOptions(products) {


    for (i = 0; i < products.length; i++) {

        var row_product_select = products;
        var select_product_select = document.getElementById('item_select_product');
        var option_product_select = document.createElement("option");
        option_product_select.value = row_product_select[i].product_ID;
        option_product_select.innerText = row_product_select[i].product_name;

        select_product_select.appendChild(option_product_select);

        instances_init();
        
    } 

}

function calcTotal(){

    var productsTotal_collection = document.getElementsByClassName('row-subtotal');
    var text_Total = document.getElementById('text_TotalSales');
    products_total = 0;
    for (i=0; i < productsTotal_collection.length; i++ ){
        products_total += parseInt(productsTotal_collection[i].innerHTML)
    }

    text_Total.innerHTML = `TOTAL: PHP  ${Number(products_total).toLocaleString()}`;

}

function populateTable(){
    
        var tr_main = document.createElement('tr');

        var td_item_no = document.createElement('td');
        var td_product = document.createElement('td');
        var td_batch_no = document.createElement('td');
        var td_expiry_date = document.createElement('td');
        var td_quantity = document.createElement('td');
        var td_unit_price = document.createElement('td');
        var td_discount = document.createElement('td');
        var td_total = document.createElement('td');
        var td_action = document.createElement('td');

        // DELETE BUTTON
        var hyperlink = document.createElement('a');
        var icon = document.createElement('i');

        hyperlink.className = "btn blue darken-4";
        icon.classList.add("material-icons");
        icon.classList.add("white-text");
        icon.innerHTML = "delete_forever";

        hyperlink.addEventListener('click', function(event){
            console.log(event.target.tagName);
            if (event.target.tagName == "I") {
                var btn_target = event.target.parentElement;
                console.log(event.target.tagName);
            } else {
                var btn_target = event.target;
                console.log(event.target.tagName)
            }
            btn_target.parentElement.parentElement.remove();

            redoItemNo();
        });

        hyperlink.appendChild(icon);
        td_action.appendChild(hyperlink);
        // 

        td_item_no.innerText = tablefill[0]
        td_product.innerText = tablefill[1]
        td_batch_no.innerText = tablefill[2]
        td_expiry_date.innerText = tablefill[3]
        td_quantity.innerText = tablefill[4]
        td_unit_price.innerText = tablefill[5]
        td_discount.innerText = `${tablefill[6]}%`
        td_total.innerText = tablefill[7]
        
        td_total.classList.add('row-subtotal');

        

        tr_main.appendChild(td_item_no);
        tr_main.appendChild(td_product);
        tr_main.appendChild(td_batch_no);
        tr_main.appendChild(td_expiry_date);
        tr_main.appendChild(td_quantity);
        tr_main.appendChild(td_unit_price);
        tr_main.appendChild(td_discount);
        tr_main.appendChild(td_total);
        tr_main.appendChild(td_action);


        var products_table = document.getElementById('tbody_products_list')

        products_table.appendChild(tr_main);
}

function redoItemNo(){

    var tbody_items = document.getElementById('tbody_products_list');
    x = tbody_items.children.length;

    for (i = 0; i < x; i++){
        var row = tbody_items.children[i];
        row.children[0].innerHTML = i + 1;    
    }
}

// BUTTON LISTENERS

$('#item_select_product').on('change',function(event){

    var select_product_ID = $("#item_select_product option:selected")[0].value;

    $('#item_select_batch')
    .find('option')
    .remove()
    .end()
    .append('<option value="" disabled selected>Choose Batch</option>')
    .val('');

    var row_product_batches = batches;

    for (i = 0; i < batches.length; i++) {


        if (row_product_batches[i].product_ID == select_product_ID){

            var select_product_batches = document.getElementById('item_select_batch');
            var option_product_batches = document.createElement("option");
            option_product_batches.value = row_product_batches[i].lot_no;
            option_product_batches.innerText = row_product_batches[i].batch_no;

            select_product_batches.appendChild(option_product_batches);

            instances_init();

        }

    } 
    
});

$('#addNewItemProduct').on('click', function(){

    x += 1;

    var modal_item_form = document.getElementById('formNewProduct');
    var item_quantity = document.getElementById('item_Quantity').value;
    var item_discount = document.getElementById('item_discount').value;
    var item_product = document.getElementById('item_select_product').selectedOptions[0].innerText;
    var item_batch = document.getElementById('item_select_batch').selectedOptions[0].innerText;
    var item_batch_lot_no = document.getElementById('item_select_batch').selectedOptions[0].value;

    var item_batch_row;
    for (i = 0; i < batches.length; i++){
        if (batches[i].lot_no == item_batch_lot_no){
            item_batch_row = batches[i];
        }
    }

    if (item_discount != 0){
        var max_total = (item_quantity * item_batch_row.unit_price)
        var total = max_total - (max_total*(item_discount*.01));
    } else {
        var total = item_quantity * item_batch_row.unit_price;
    }


    var expiration = moment(item_batch_row.expiration_Date, "ddd MMM DD YYYY HH:mm:ss");
    var format_exp = expiration.format('MMM DD, YYYY');

    tablefill = [
        x,
        item_product,
        item_batch_row.batch_no,
        format_exp,
        item_quantity,
        item_batch_row.unit_price,
        item_discount,
        total,
    ];

    populateTable();
    calcTotal();

    modal_item_form.reset();
});

$('#addNewSale').on('click', function(){

    var CDR_no = parseInt(document.getElementById('dr_no').value);
    var sales_invoice_no = parseInt(document.getElementById('sales_invoice_no').value);
    var submit_total = products_total;
    var first_name = document.getElementById('first_name').value;
    var middle_initial = document.getElementById('middle_initial').value;
    var last_name = document.getElementById('last_name').value;
    var suffix = document.getElementById('suffix').value;
    var client_address = document.getElementById('client_address').value;
    // var completion_date = document.getElementById('completion_date').value;
    var payment_option = document.getElementById('select_payment').value;
    var payment_duedate = document.getElementById('payment_duedate').value;
    var delivery_date = document.getElementById('delivery_Date').value;
    var ordered_date = document.getElementById('ordered_date').value;
    var delivery_fee = parseInt(document.getElementById('delivery_fee').value);
    var booked_by = document.getElementById('booked_by').value;

    var sales_form = document.getElementById('formSales');
    var products_table = document.getElementById('tbody_products_list');

    var CDR_insert = [
        CDR_no,
        sales_invoice_no,
        submit_total,
        first_name,
        middle_initial,
        last_name,
        suffix,
        client_address,
        // completion_date,
        payment_option,
        payment_duedate,
        delivery_date,
        ordered_date,
        delivery_fee,
        booked_by
        ];

    var product_ordered_insert = [];

    for (i = 0; i < products_table.children.length; i++){
        var product_row = products_table.children[i].children;

        if (product_row[6].innerHTML == "%"){
            var row_dicsount = 0;
        } else {
            var row_dicsount = parseInt(product_row[6].innerHTML.replace("%","")) * 0.01;
        }
        
        var insert_row = [
            CDR_no,
            product_row[1].innerHTML,
            product_row[2].innerHTML,
            parseInt(product_row[0].innerHTML),
            parseInt(product_row[4].innerHTML),
            parseInt(product_row[7].innerHTML),
            row_dicsount,
        ];
        product_ordered_insert.push(insert_row);
    }

    ipc.send('sales:createNewSale', [CDR_insert,product_ordered_insert] );
    console.log([CDR_insert,product_ordered_insert]);

    sales_form.reset();
    products_table.innerHTML = "";
    M.updateTextFields();

});
// Other Functions

function instances_init(){
    var elems = document.querySelectorAll('select');
    var options = {};
    var instances = M.FormSelect.init(elems, options);
}