const electron = require('electron');
const ipc = electron.ipcRenderer;
const moment = require('moment');
const $ = require( "jquery" );





$('#addStock').on('click', function (){

    ipc.send('sales:loadAddNewSale',"data");
    ipc.send('sales:loadAddNewSale:sendData');

});

ipc.on('sales:loadMasterlist:FrontEnd', function(event,data){
    
    var tbody_sales = document.getElementById("tbody_sales");
    tbody_sales.innerHTML = "";
    
    for (i in data){

        var current_row = data[i];

        var tr_main = document.createElement('tr');

        var td_CDR_no = document.createElement('td');
        var td_name = document.createElement('td');
        var td_delivery_date = document.createElement('td');
        var td_price = document.createElement('td');
        var td_action = document.createElement('td');

        var view_button = document.createElement('button');
        var edit_button = document.createElement('button');

        var deliv = moment(data[i].delivery_date, "ddd MMM DD YYYY HH:mm:ss");
        var deliv_format = deliv.format('MMM DD, YYYY');

        td_CDR_no.innerHTML = data[i].CDR_no;
        td_name.innerHTML = data[i].first_name + " " + data[i].last_name;
        td_delivery_date.innerHTML = deliv_format;
        td_price.innerHTML = "PHP " + Number(data[i].total).toLocaleString();
        
        view_button.className = "waves-effect waves-light btn";
        view_button.classList.add("blue");
        view_button.classList.add("darken-4");
        view_button.classList.add("view-batch");
        view_button.value = data[i].CDR_no;
        view_button.style.marginRight = "5px";
        view_button.innerHTML = "View";

        edit_button.className = "waves-effect waves-light btn";
        edit_button.classList.add("blue");
        edit_button.classList.add("darken-4");
        edit_button.classList.add("view-batch");
        edit_button.value = data[i].CDR_no;
        edit_button.innerHTML = "Edit";

        view_button.addEventListener('click', function(event){
            
            var view_value = event.target.value;

            ipc.send('sales:loadViewPage',view_value);

        });

        edit_button.addEventListener('click', function(event){
            
            var edit_value = event.target.value;

            ipc.send('sales:loadEditPage', edit_value);

        });


        td_action.appendChild(view_button);
        td_action.appendChild(edit_button);

        tr_main.appendChild(td_CDR_no);
        tr_main.appendChild(td_name);
        tr_main.appendChild(td_delivery_date);
        tr_main.appendChild(td_price);
        tr_main.appendChild(td_action);
        
        tbody_sales.appendChild(tr_main);

    }
    
    

});