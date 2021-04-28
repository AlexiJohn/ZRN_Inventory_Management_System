const electron = require('electron');
const ipc = electron.ipcRenderer;
const moment = require('moment');
const $ = require( "jquery" );


var x = 0;
var products;
var batches;
var CDR;
var products_ordered;
var tablefill;
var products_total = 0;


ipc.on('sales:loadViewPage:redirect', function(event,data){

    products = data[0];
    batches = data[1];
    CDR = data[2];
    products_ordered = data[3];
    console.log(data);

    prepopulateTable();
    fillCDR();
});

function prepopulateTable(){
    
    for (i in products_ordered){
        var PO_row = products_ordered[i];

        var tr_main = document.createElement('tr');
        var td_item_no = document.createElement('td');
        var td_product = document.createElement('td');
        var td_batch_no = document.createElement('td');
        var td_expiry_date = document.createElement('td');
        var td_quantity = document.createElement('td');
        var td_unit_price = document.createElement('td');
        var td_discount = document.createElement('td');
        var td_total = document.createElement('td');

        var expiry;
        var price;

        for(i in batches) {
            var BATCH_row = batches[i];

            if (BATCH_row.batch_no == PO_row.batch_no){
                expiry = BATCH_row.expiration_Date;
                price = BATCH_row.unit_price;
            }
        }


        // td_item_no.innerText = PO_row.item_no;
        td_product.innerText = PO_row.product_name;
        td_batch_no.innerText = PO_row.batch_no;
        td_expiry_date.innerText = moment(expiry,"ddd MMM DD YYYY HH:mm:ss").format('MMM DD, YYYY');
        td_quantity.innerText = PO_row.quantity;
        td_unit_price.innerText = price;
        td_discount.innerText = (PO_row.discount * 100) + "%";
        td_total.innerText = PO_row.subtotal;
        
        td_total.classList.add('row-subtotal');

        // tr_main.appendChild(td_item_no);
        tr_main.appendChild(td_product);
        tr_main.appendChild(td_batch_no);
        tr_main.appendChild(td_expiry_date);
        tr_main.appendChild(td_quantity);
        tr_main.appendChild(td_unit_price);
        tr_main.appendChild(td_discount);
        tr_main.appendChild(td_total);

        var products_table = document.getElementById('tbody_sales');

        products_table.appendChild(tr_main);

    }

        
}

function fillCDR(){

    var cdr_no = document.getElementById("cdr_no");
    var client_name = document.getElementById("client_name");
    var date_ordered = document.getElementById("date_ordered");
    var payment_option = document.getElementById("payment_option");
    var payment_duedate = document.getElementById("payment_duedate");
    var delivery_date = document.getElementById("delivery_date");

    cdr_no.innerHTML = `CDR No. : ${CDR[0].CDR_no}`;
    client_name.innerHTML = `${CDR[0].first_name} ${CDR[0].middle_initial} ${CDR[0].last_name}`;
    date_ordered.innerHTML = `${moment(CDR[0].ordered_date, "ddd MMM DD YYYY HH:mm:ss").format("MMM DD, YYYY")}`;
    payment_option.innerHTML = `${CDR[0].payment_option}`;
    payment_duedate.innerHTML = `${moment(CDR[0].payment_duedate, "ddd MMM DD YYYY HH:mm:ss").format("MMM DD, YYYY")}`;
    delivery_date.innerHTML = `${moment(CDR[0].delivery_date, "ddd MMM DD YYYY HH:mm:ss").format("MMM DD, YYYY")}`;
}