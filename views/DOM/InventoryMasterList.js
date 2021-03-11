const electron = require('electron');
const ipc = electron.ipcRenderer;

const $ = require( "jquery" );

var product;
var batch;
var tbody = document.getElementById('tbody_inventory');

//shows batches' tables
$(document).on('click','.view-product', function(event){
    
    var get_tr_id = event.target.getAttribute('name') + "_batch";
    var get_tr_main_id = event.target.getAttribute('name') + "_product_ID";

    var tr_main_get = document.getElementById(get_tr_main_id);
    var list_tr_id = document.getElementsByName(get_tr_id);
    
    var tr_item;

    if (event.target.value == 'false'){

        var tr_main_event = $("#" + get_tr_main_id + " *");
        tr_main_event.css('color', '#ffffff');
        list_tr_id.item(list_tr_id.length - 1).style.boxShadow = '0 4px 10px -5px #29468c';

        for ( i = 0; i < list_tr_id.length; i++){
            
            tr_item = list_tr_id.item(i);
            tr_item.style.display = "";

            tr_main_get.style.backgroundColor = "#29468c";
            event.target.classList.remove("blue");
            event.target.classList.remove("darken-4");
            
            event.target.classList.add("white");
            event.target.classList.add("blue-text");
            event.target.classList.add("text-darken-4");


        }
        event.target.value = 'true';

    } else {

        $("#" + get_tr_main_id + " *").css('color', '#000000');
        $("#" + get_tr_main_id + " button").css('color', '#ffffff');
        list_tr_id.item(list_tr_id.length - 1).style.boxShadow = '';
        
        for ( i = 0; i < list_tr_id.length; i++){
            
            tr_item = list_tr_id.item(i);
            tr_item.style.display = "none";

            tr_main_get.style.backgroundColor = "";

            event.target.classList.remove("white");
            event.target.classList.remove("blue-text");
            event.target.classList.remove("text-darken-4");

            event.target.classList.add("blue");
            event.target.classList.add("darken-4");
        }
        event.target.value = 'false';

    }
});

$(document).on('click','.view-batch', function(event){

    var target = $(event.target).parent().parent();
    var lot_no = target.data('value');

    ipc.send('inventory:viewBatch', lot_no);
});

ipc.on('inventory:getInventory:product', function(event,data){
    
    var current_row;
    product = data;

    tbody.textContent = "";

    for ( i=0; i < product.length; i++){
        
        current_row = product[i];

        var tr_main = document.createElement('tr');

        var td_product_name = document.createElement('td');
        var td_current_inventory = document.createElement('td');
        var td_Starting_Inventory = document.createElement('td');
        var td_Offtake = document.createElement('td');
        var td_Ending_Inventory = document.createElement('td');
        var td_Status = document.createElement('td');
        var td_action = document.createElement('td');
        var td_button = document.createElement('button');
        

        tr_main.id = current_row.product_ID + "_product_ID";
        tr_main.value = 1;
        td_product_name.innerText = current_row.product_name;
        td_current_inventory.innerText = current_row.quantity_sum;
        td_Starting_Inventory.innerText = current_row.quantity_sum;
        td_Offtake.innerText = 0;
        td_Ending_Inventory.innerText = current_row.quantity_sum;
        
        td_button.innerText = 'View';
        td_button.className = "waves-effect waves-light btn";
        td_button.setAttribute('name', current_row.product_ID);
        td_button.value = false;
        td_button.classList.add("blue");
        td_button.classList.add("darken-4");
        td_button.classList.add("view-product");

        tr_main.appendChild(td_product_name);
        tr_main.appendChild(td_current_inventory);
        tr_main.appendChild(td_Starting_Inventory);
        tr_main.appendChild(td_Offtake);
        tr_main.appendChild(td_Ending_Inventory);
        tr_main.appendChild(td_Status);
        tr_main.appendChild(td_action);
        td_action.appendChild(td_button);

        tbody.appendChild(tr_main);

    }

});

ipc.on('inventory:getInventory:batch', function(event, data){

    var current_row;
    batch = data;

    for ( i=0; i < batch.length; i++){

        current_row = batch[i];

        var tr_id = "#" + current_row.product_ID + "_product_ID";

        var tr_main = document.createElement('tr');

        var td_product_name = document.createElement('td');
        var td_current_inventory = document.createElement('td');
        var td_Starting_Inventory = document.createElement('td');
        var td_Offtake = document.createElement('td');
        var td_Ending_Inventory = document.createElement('td');
        var td_Status = document.createElement('td');
        var td_action = document.createElement('td');
        var td_button = document.createElement('button');

        tr_main.setAttribute("name", current_row.product_ID + "_batch");
        tr_main.setAttribute("data-value", current_row.lot_no);
        tr_main.style = 'display:none';
        td_product_name.innerText = current_row.batch_no;
        td_current_inventory.innerText = current_row.quantity;
        td_Starting_Inventory.innerText = current_row.quantity;
        td_Offtake.innerText = 0;
        td_Ending_Inventory.innerText = current_row.quantity;
        
        td_button.innerText = 'View';
        td_button.className = "waves-effect waves-light btn";
        td_button.classList.add("blue");
        td_button.classList.add("darken-4");
        td_button.classList.add("view-batch");

        tr_main.appendChild(td_product_name);
        tr_main.appendChild(td_current_inventory);
        tr_main.appendChild(td_Starting_Inventory);
        tr_main.appendChild(td_Offtake);
        tr_main.appendChild(td_Ending_Inventory);
        tr_main.appendChild(td_Status);
        tr_main.appendChild(td_action);
        td_action.appendChild(td_button);

        $(tr_main).insertAfter($(tr_id).last());

    };

});