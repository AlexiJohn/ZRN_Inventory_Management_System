const electron = require('electron');
const ipc = electron.ipcRenderer;
const moment = require('moment');

const $ = require( "jquery" );

var notifs;
var batches;
var products;

var notif_div = document.getElementById("notifications");

ipc.on('notify:getNotifs', function(event,data){

    notifs = data[0];
    batches = data[1];
    products = data[2];
    console.log(notifs)
    lazy_notifs();
})

function lazy_notifs(){
    notif_div.innerHTML = ""

    for (i of notifs){

        for (ii of batches){
            if (i.lot_no == ii.lot_no ){
                var batch_no = ii.batch_no
                var expiration_date = ii.expiration_Date

                for (iii of products){
                    if (ii.product_ID == iii.product_ID){
                        var product_name = iii.product_name
                    }
                }
            }
        }
        notif_div.innerHTML += `<div class="col s12 m7">
        <h4 class="header">${i.descript}</h4>
        <div class="card horizontal">
          <div class="card-stacked">
            <div class="card-content">
              <p>Product: ${product_name}</p>
              <p>Batch: ${batch_no}</p>
              <p>Expiration Date: ${expiration_date}</p>
            </div>
          </div>
        </div>
      </div>`
    }
}