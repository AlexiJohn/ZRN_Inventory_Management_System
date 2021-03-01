const electron = require('electron');
const ipc = electron.ipcRenderer;

const $ = require( "jquery" );


const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

var manufacturer_name;

// dynamically update product select and manufacturer select
$('#select_product').on('change',function(event){

    var select_product_ID = $("#select_product option:selected")[0].value;

    ipc.send('batch:updateManuSelect', select_product_ID);
    
});

ipc.on('batch:getManuSelect', function(event,data){
    
    $('#select_manu').val(data[0].manufacturer_ID);

    instances_init();
});

function submitForm(e){

    e.preventDefault();

    // Get values of the form
    var product_ID = document.getElementById('select_product').selectedOptions[0].value;

    manufacturer_name = document.getElementById('select_manu').selectedOptions[0].value;

    var batch_no = document.querySelector('#batch_no').value;
    var delivery_Date = document.querySelector('#delivery_Date').value;
    var expiration_Date = document.querySelector('#expiration_Date').value;
    var quantity = document.querySelector('#quantity').value;
    var unit_price = document.querySelector('#unit_price').value;
    var threshold = document.querySelector('#threshold').value;

    var data = [product_ID, manufacturer_name, batch_no, 
        delivery_Date, expiration_Date, quantity,
        unit_price, threshold];

    console.log(data);
    
    ipc.send('batch:addNewBatch', data);
    form.reset();
    
}

ipc.on('batch:getManuList', function(event,data){

    var manu_list = data;

    for (i = 0; i < manu_list.length; i++) {

        var row_m = data[i];
        var select_m = document.getElementById('select_manu');
        var option_m = document.createElement("option");
        option_m.value = row_m.manufacturer_ID;
        option_m.innerText = row_m.manufacturer_name;
        option_m.setAttribute('disabled',true); 

        select_m.appendChild(option_m);

        instances_init();
        
    } 

});

ipc.on('batch:getProductList', function(event,data){

    var prod_list = data;

    console.log(prod_list);

    for (i = 0; i < prod_list.length; i++){

        var row_p = prod_list[i];
        var select_p = document.getElementById('select_product');
        var option_p = document.createElement("option");
        option_p.value = row_p.product_ID;
        option_p.innerText = row_p.product_name;

        select_p.appendChild(option_p);

        instances_init();

    }
});


function instances_init(){
    var elems = document.querySelectorAll('select');
    var options = {};
    var instances = M.FormSelect.init(elems, options);
}