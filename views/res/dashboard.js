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

from_date.value = moment().subtract(7,'days').format('YYYY-MM-DD');
to_date.value = now;

function query(){

    var date1 = from_date.value;
    var date2 = to_date.value;

    ipc.send('dashboard:generateReport', [date1,date2]);

}

var pending;
var total_pending;
var total_complete;
var total_ordered;
var top_performing;

ipc.on('dashboard:onload', function(event, data){
    
    pending = data.pending
    total_pending = data.total_pending;
    total_complete = data.total_completed;
    total_ordered = data.total_ordered;
    top_performing = data.top_performing;
    console.log(data)
    pending_orders()
    generateReports();
});

function pending_orders(){

    var div_pending_orders = document.getElementById("pending_orders");
    div_pending_orders.innerHTML = "";

    for (i of pending) {
        div_pending_orders.innerHTML += `
            <div class="fixed-width-card">
                <div class="card white">
                  <div class="card-content">
                    <p style="font-size: small;">${moment(i.delivery_date, "ddd MMM DD YYYY HH:mm:ss").format('MMM DD, YYYY')}</p>
                    <p style="font-size: x-large; font-weight: bold;">${i.first_name} ${i.last_name}</p>
                    <p style="font-size: x-large;">DR# ${i.CDR_no}</p>
                    <p style="font-size: medium;">Total Order Volume: ${Number(i.quantity).toLocaleString()}</p>
                    <p style="font-size: x-large; font-weight: bold;">PHP ${Number(i.total).toLocaleString()}</p>
                  </div>
                </div>
            </div>`;
    }
}

function generateReports(){
    var p_completed_orders = document.getElementById("completed_deliveries");
    var p_pending_orders = document.getElementById("pending_deliveries");
    var p_total_sales = document.getElementById("total_sales");
    var tbody_top_performing = document.getElementById("tbody_top");

    p_completed_orders.innerHTML = `${total_complete[0].CDR_no} Deliveries`;
    p_pending_orders.innerHTML = `${total_pending[0].CDR_no} Deliveries`;
    p_total_sales.innerHTML = `PHP ${Number(total_ordered[0].total).toLocaleString()}`;

    tbody_top_performing.innerHTML = "";
    for(i of top_performing){
        tbody_top_performing.innerHTML += `<tr>
        <td>${i.product_name}</td>
        <td>${moment(i.expiration_Date, "ddd MMM DD YYYY HH:mm:ss").format('MMM DD, YYYY')}</td>
        <td>${i.unit_price}</td>
        <td>${i.quantity}</td>
    </tr>`;
    }
    
}

