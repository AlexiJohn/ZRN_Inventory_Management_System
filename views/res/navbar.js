var dashboardNav = document.getElementById("dashboardNav");
var inventoryNav = document.getElementById("inventoryNav");
var salesNav = document.getElementById("salesNav");
var historyNav = document.getElementById("historyNav");
var reportsNav = document.getElementById("reportsNav");


dashboardNav.addEventListener('click', function(){

});

inventoryNav.addEventListener('click', function(){
    ipc.send('nav:inventory','data');
});

salesNav.addEventListener('click', function(){
    
});

historyNav.addEventListener('click', function(){

});
reportsNav.addEventListener('click', function(){

});

