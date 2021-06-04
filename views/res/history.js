const electron = require('electron');
const ipc = electron.ipcRenderer;
const moment = require('moment');

const $ = require( "jquery" );

var from_date = document.getElementById('from_Date');
var to_date = document.getElementById('to_Date');
var now = moment().format('YYYY-MM-DD');

M.updateTextFields();

from_date.value = moment().subtract(7,'days').format('YYYY-MM-DD');
to_date.value = now;

$('#from_Date').on('change', query);
$('#to_Date').on('change', query);

function query(){

    var date1 = from_date.value;
    var date2 = to_date.value;

    ipc.send('history:range', [date1,date2]);

}

ipc.on('history:onload', function(event,data){

    var cards = document.getElementById('cards');
    cards.innerHTML = ""
    console.log(data)
    for (i of data){
        cards.innerHTML += `<div class="row">
        <div class="col s12 m6">
          <div class="card white">
            <div class="card-content">
              <span class="card-title" style="font-weight: bold;">Log Type: ${i.adjustment_type.toUpperCase()}</span>
              <p>${i.descript}</p>
              <p>Timestamp: ${i.timestmp}</p>
            </div>
          </div>
        </div>
      </div>`;
    }
});