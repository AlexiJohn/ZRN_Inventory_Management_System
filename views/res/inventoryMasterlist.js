const electron = require('electron');
const ipc = electron.ipcRenderer;
const moment = require('moment');
const $ = require( "jquery" );

var product;
var batch;
var tbody = document.getElementById('tbody_inventory');

var manufacturer_name;

var validated_product;
var validated_batch;

$(document).ready(function() {
    M.updateTextFields();
});

var check = document.querySelector('#new_manu');
check.addEventListener("click", changeInput);

const buttonformProduct = document.querySelector('#addProduct');
buttonformProduct.addEventListener('click', submitFormProduct);

const formProduct = document.querySelector('#formproduct');
const formBatch = document.querySelector('#formbatch');

const buttonformBatch = document.querySelector('#addBatch');
buttonformBatch.addEventListener('click', submitFormBatch);

// NEW PRODUCT

function submitFormProduct(e){
    
    console.log("CLICKED")

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
        console.log(check.checked)
        ipc.send('batch:add', data);
        formProduct.reset();
        formBatch.reset();
    } else {
        ipc.send('batch:existingManu',data);
        console.log(check.checked)
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
    var select_mn = document.getElementById('b_select_manu');
    select_mn.innerHTML = '<option value="" disabled selected>Choose Manufacturer</option>'

    for (i = 0; i < manu_list.length; i++) {

        var row_mn = data[i];
        
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
    var select_m = document.getElementById('select_manu');
    select_m.innerHTML = `<option value="" disabled selected>Choose Manufacturer</option>`
    for (i = 0; i < manu_list.length; i++) {

        var row_m = data[i];
        
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
        td_Status.id = current_row.product_ID + "_product_ID_Status" 
        
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

    var icon_out_of_stock = `<i class="material-icons red-text">warning</i> Out of Stock `
    var icon_low_stock = `<i class="material-icons yellow-text text-darken-1">warning</i> Low Stock `
    var icon_expiring = `<div class="col s12">
    <i class="material-icons orange-text text-darken-1">hourglass_empty</i> Expiring
    </div>`
    var icon_expired = `<div class="col s12">
    <i class="material-icons grey-text text-darken-1">hourglass_empty</i> Expired
    </div>` 
    var icon_good = `<i class="material-icons green-text text-accent-4">check_circle</i> Available`

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

        if (current_row.status == "good" && current_row.status2 == "good"){
            td_Status.innerHTML = icon_good;
        } 
        else if (current_row.status == "expiring") {
            td_Status.innerHTML += icon_expiring
        }
        else if (current_row.status == "expired") {
            td_Status.innerHTML += icon_expired
        }
        if (current_row.status2 == "low_stock") {
            td_Status.innerHTML += icon_low_stock
        }
        else if (current_row.status2 == "out_of_stock") {
            td_Status.innerHTML += icon_out_of_stock
        } 

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

    icons_status();
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

function validate_newProduct(){

    var product_name = document.querySelector('#product_name');
    var batch_no = document.querySelector('#batch_no');
    var delivery_Date = document.querySelector('#delivery_Date');
    var expiration_Date = document.querySelector('#expiration_Date');
    var quantity = document.querySelector('#quantity');
    var unit_price = document.querySelector('#unit_price');
    var threshold = document.querySelector('#threshold');

    var inputlist = [
        product_name,
        batch_no,
        quantity,
        unit_price,
        threshold,
    ]

    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    var validity = true;

    for (i of inputlist){
        if(i.value==""){
            console.log(i.id)
            var helper = document.getElementById(i.id+"Helper")
            helper.classList.remove('valid');
            helper.classList.add('invalid');
        } else {
            var helper = document.getElementById(i.id+"Helper")
            helper.classList.remove('invalid');
            helper.classList.add('valid');
            validity = false;
        }
    }
    
    if (batch_no.value.match(format)){
        var helper = document.getElementById(batch_no.id+"Helper")
        helper.classList.remove('valid');
        helper.classList.add('invalid');
    } else {
        var helper = document.getElementById(i.id+"Helper")
        helper.classList.remove('invalid');
        helper.classList.add('valid');
        validity = false;
    }

    M.updateTextFields();

    return validity;

}

// $.validator.setDefaults({
//     errorClass: 'invalid',
//     validClass: "valid",
//     errorPlacement: function(error, element) {
//       $(element)
//         .closest("form")
//         .find("label[for='" + element.attr("id") + "']")
//         .attr('data-error', error.text());
//     },
//     submitHandler: function(form) {
//       console.log('form ok');
//     }
//   });


// $("#formproduct").validate({
// rules: {
//     dateField: {
//     date: true
//     }
// }
// });

var all_product;
var all_batch;

ipc.on('inventory:icons', function(event,data){

    all_product = data.products
    all_batch = data.batches
});

function icons_status(){
    var product_out_of_stock = `<i class="material-icons red-text">warning</i> `
    var product_low_stock = `<i class="material-icons yellow-text text-darken-1">warning</i> `
    var product_expiring = `<i class="material-icons orange-text text-darken-1">hourglass_empty</i> `  
    var product_expired = `<i class="material-icons grey-text text-darken-1">hourglass_empty</i> `  
    var product_good = `<i class="material-icons green-text text-accent-4">check_circle</i> `

    var statuses = []
    for (i of all_product) {
        var current_status = {
            product_ID: i.product_ID,
            low_stock: 0,
            out_of_stock: 0,
            expiring: 0,
            expired: 0,
            good: 0,
        }

        for (ii of all_batch) {
            if (i.product_ID == ii.product_ID){
                current_status[ii.status] += 1;
                current_status[ii.status2] += 1;
            }
        }

        statuses.push(current_status);
        console.log(statuses)
    }

    for (i of statuses){
        console.log(i.product_ID + "HERE")
        var td_statuses = document.getElementById(i.product_ID+"_product_ID_Status");
        td_statuses.innerHTML = ""
        var status_good = i.low_stock + i.out_of_stock + i.expiring + i.expired
        if(status_good == 0){
            td_statuses.innerHTML = product_good;
        }
        if(i.low_stock > 0){
            td_statuses.innerHTML += product_low_stock + i.low_stock
        }
        if(i.out_of_stock > 0){
            td_statuses.innerHTML += product_out_of_stock + i.out_of_stock
        }
        if(i.expiring > 0){
            td_statuses.innerHTML += product_expiring + i.expiring
        }
        if(i.expired > 0){
            td_statuses.innerHTML += product_expired + i.expired
        }
    }

}