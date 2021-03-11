const electron = require('electron');
const ipc = electron.ipcRenderer;

const $ = require( "jquery" );

$("#btn_login").on('click', function(event){

    ipc.send('login','data');    

});

