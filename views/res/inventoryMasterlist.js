const electron = require('electron');
const ipc = electron.ipcRenderer;

const $ = require( "jquery" );

var product;
var batch;
var tbody = document.getElementById('tbody_inventory');

var manufacturer_name;

$(document).ready(function() {
    M.updateTextFields();
});

var check = document.querySelector('#new_manu');
check.addEventListener("click", changeInput);

const formProduct = document.querySelector('#formproduct');
formProduct.addEventListener('submit', submitFormProduct);

const formBatch = document.querySelector('#formbatch');
formBatch.addEventListener('submit', submitFormBatch);

// NEW PRODUCT

function submitFormProduct(e){

    e.preventDefault();

    // Get values of the form
    var product_name = document.querySelector('#product_name').value;

    checkedManu();

    var batch_no = document.querySelector('#batch_no').value;
    var delivery_Date = document.querySelector('#delivery_Date').value;
    var expiration_Date = document.querySelector('#expiration_Date').value;
    var quantity = document.querySelector('#quantity').value;
    var unit_price = document.querySelector('#unit_price').value;
    var threshold = document.querySelector('#threshold').value;

    var data = [product_name, manufacturer_name, batch_no, 
        delivery_Date, expiration_Date, quantity,
        unit_price, threshold];

    send_data(data);
    
}

function send_data (data){

    if (check.checked == true){
        ipc.send('batch:add', data);
        formProduct.reset();
        formBatch.reset();
    } else {
        ipc.send('batch:existingManu',data);
        formProduct.reset();
        formBatch.reset();
    }

}

function changeInput(){
    if (check.checked == false){
        var input_manu = document.querySelector("#manufacturer_name");
        input_manu.style.display = "none";

        var selection_manu = document.querySelector("#selection_manu");
        selection_manu.style.display = "block";
    } else {
        var input_manu = document.querySelector("#manufacturer_name");
        input_manu.style.display = "block";

        var selection_manu = document.querySelector("#selection_manu");
        selection_manu.style.display = "none";
    }
}

function checkedManu(){

    if (check.checked == true){
        manufacturer_name = document.querySelector('#manufacturer_name').value;
    } else {
        manufacturer_name = document.getElementById('select_manu').selectedOptions[0].value;
        console.log(manufacturer_name);
    }

}

// NEW BATCH

function submitFormBatch(e){

    e.preventDefault();

    // Get values of the form
    var product_ID = document.getElementById('b_select_product').selectedOptions[0].value;

    manufacturer_name = document.getElementById('b_select_manu').selectedOptions[0].value;

    var batch_no = document.querySelector('#b_batch_no').value;
    var delivery_Date = document.querySelector('#b_delivery_Date').value;
    var expiration_Date = document.querySelector('#b_expiration_Date').value;
    var quantity = document.querySelector('#b_quantity').value;
    var unit_price = document.querySelector('#b_unit_price').value;
    var threshold = document.querySelector('#b_threshold').value;

    var data = [product_ID, manufacturer_name, batch_no, 
        delivery_Date, expiration_Date, quantity,
        unit_price, threshold];

    console.log(data);
    
    ipc.send('batch:addNewBatch', data);
    formBatch.reset();
    
}

ipc.on('batch:getManuList', function(event,data){

    var manu_list = data;

    for (i = 0; i < manu_list.length; i++) {

        var row_mn = data[i];
        var select_mn = document.getElementById('b_select_manu');
        var option_mn = document.createElement("option");
        option_mn.value = row_mn.manufacturer_ID;
        option_mn.innerText = row_mn.manufacturer_name;
        option_mn.setAttribute('disabled',true); 

        select_mn.appendChild(option_mn);

        instances_init();
        
    } 

});

ipc.on('batch:getProductList', function(event,data){

    var prod_list = data;

    for (i = 0; i < prod_list.length; i++){

        var row_p = prod_list[i];
        var select_p = document.getElementById('b_select_product');
        var option_p = document.createElement("option");
        option_p.value = row_p.product_ID;
        option_p.innerText = row_p.product_name;

        select_p.appendChild(option_p);

        instances_init();

    }
});

ipc.on('batch:getManuList', function(event,data){

    var manu_list = data;

    for (i = 0; i < manu_list.length; i++) {

        var row_m = data[i];
        var select_m = document.getElementById('select_manu');
        var option_m = document.createElement("option");
        option_m.value = row_m.manufacturer_ID;
        option_m.innerText = row_m.manufacturer_name; 

        select_m.appendChild(option_m);
        var elems = document.querySelectorAll('select');
        var options = {};
        var instances = M.FormSelect.init(elems, options);
        
    } 

});

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

    console.log(product, 'here');
    
    tbody.innerHTML = "";

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


// Dynamically update product select and manufacturer select

$('#b_select_product').on('change',function(event){

    var select_product_ID = $("#b_select_product option:selected")[0].value;

    if (select_product_ID !== ""){
        ipc.send('batch:updateManuSelect', select_product_ID);
    } 
    
});

ipc.on('batch:getManuSelect', function(event,data){
    

    $('#b_select_manu').val(data[0].manufacturer_ID);

    instances_init();

});

// Other Functions

function instances_init(){
    var elems = document.querySelectorAll('select');
    var options = {};
    var instances = M.FormSelect.init(elems, options);
}