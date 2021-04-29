const electron = require('electron');
const ipc = electron.ipcRenderer;
const moment = require('moment');

const $ = require( "jquery" );

$('#from_Date').on('change', query);
$('#to_Date').on('change', query);

var from_date = document.getElementById('from_Date');
var to_date = document.getElementById('to_Date');
var now = moment().format('YYYY-MM-DD');

M.updateTextFields();

from_date.value = now;
to_date.value = now;

function query(){

    var date1 = from_date.value;
    var date2 = to_date.value;

    ipc.send('dashboard:generateReports',[date1,date2]);

}

query();

ipc.on('dashboard:receiveReports', function(event, data){

    var report_date_today = document.getElementById('report_date_today');
    var report_sales = document.getElementById('report_sales');
    var report_total_sales = document.getElementById('report_total_sales');

    report_date_today.innerHTML = "As of: " + moment().format("MMM DD, YYYY");
    var number_sales = data[0].length;
    var total_sales = 0;
    for (i in data[0]){
        console.log(data[0][i].total)
        total_sales += data[0][i].total;
    }

    report_sales.innerHTML = "No. Sales: " + number_sales;
    report_total_sales.innerHTML = "Total Sale: " + total_sales;

    var tbody = document.getElementById("tbody_products_ordered");
    tbody.innerHTML = "";
    for (i in data[1]){
        var tr_main = document.createElement('tr');
        var td_CDR_no = document.createElement('td');
        var td_product_name = document.createElement('td');
        var td_batch_no = document.createElement('td');
        var td_quantity = document.createElement('td');
        var td_discount = document.createElement('td');
        var td_subtotal = document.createElement('td');

        td_CDR_no.innerHTML = data[1][i].CDR_no;
        td_product_name.innerHTML = data[1][i].product_name;
        td_batch_no.innerHTML = data[1][i].batch_no;
        td_quantity.innerHTML = data[1][i].quantity;
        td_discount.innerHTML = (data[1][i].discount * 100) + "%";
        td_subtotal.innerHTML = "PHP " + Number(data[1][i].subtotal).toLocaleString();

        tr_main.appendChild(td_CDR_no);
        tr_main.appendChild(td_product_name);
        tr_main.appendChild(td_batch_no);
        tr_main.appendChild(td_quantity);
        tr_main.appendChild(td_discount);
        tr_main.appendChild(td_subtotal);
        tbody.appendChild(tr_main);
    }
    


});

