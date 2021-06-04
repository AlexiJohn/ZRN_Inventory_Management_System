var dashboardNav = document.getElementById("dashboardNav");
var inventoryNav = document.getElementById("inventoryNav");
var salesNav = document.getElementById("salesNav");
var historyNav = document.getElementById("historyNav");
var reportsNav = document.getElementById("reportsNav");
var notifsNav = document.getElementById("notificationNav");



dashboardNav.addEventListener('click', function(){
    ipc.send('nav:dashboard','data');
});

inventoryNav.addEventListener('click', function(){
    ipc.send('nav:inventory','data');
    console.log('INVENTORY');
});

salesNav.addEventListener('click', function(){
    ipc.send('nav:sales','data');
    console.log('SALES');
});

historyNav.addEventListener('click', function(){
    ipc.send('nav:history','data');
});

reportsNav.addEventListener('click', function(){

});

notifsNav.addEventListener('click', function(){
    ipc.send('nav:notifs','data');
    console.log('NOTIFS');
});

ipc.on('notifs:navbar', function(event,data){
    console.log("READ")
    
    notifsNav.innerHTML = `<img class = "navicon" src="./images/Notification Icon.png">Notifications`
    
    if(data[0].unread != 0){
        notifsNav.innerHTML += `<span class="new badge">${data[0].unread}</span>`
    }
    
});


function update() {
  $('#timestamp').html(moment().format('D. MMMM YYYY H:mm:ss'));
}

setInterval(update, 1000);
