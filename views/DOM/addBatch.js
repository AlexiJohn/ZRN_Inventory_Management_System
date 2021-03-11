const electron = require('electron');
const ipc = electron.ipcRenderer;
const Joi = require('joi');

const $ = require( "jquery" );

const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

var check = document.querySelector('#new_manu');
check.addEventListener("click", changeInput);

var manufacturer_name;

/* const schema = Joi.object({
    product : Joi.string()
        .alphanum()
        .max(30)
        .trim()
        .required(),
    batch : Joi.string()
        .alphanum()
        .max(10)
        .required(),
    deliver_date : Joi.date()
        .required(),
    expiration_date : Joi.date()
        .required(),
    quantity : Joi.number()
        .required(),
    price : Joi.number()
        .required(),
    threshold : Joi.number()
        .max(Joi.ref('quantity'))
}); */

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

function submitForm(e){

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
    
    var schema_data = {

        product : product_name,
        batch : batch_no,
        deliver_date : delivery_Date,
        expiration_date : expiration_Date,
        quantity : quantity,
        price : unit_price,
        threshold : threshold

    };

    send_data(data);

    /* if (schema.validate(schema_data).error == null){
        console.log("it works");
    } else {
        console.log(schema.validate(schema_data).error);
    } */
    
}

function send_data (data){

    if (check.checked == true){
        ipc.send('batch:add', data);
        form.reset();
    } else {
        ipc.send('batch:existingManu',data);
        form.reset();
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

