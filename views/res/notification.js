var notification_bar = document.getElementById('notifications');
var notif_badge = document.getElementById('notif_badge');
var notifs;
var batches;
var products;
ipc.on('notify:getNotifs', function(event, data){

    notifs = data[0];
    batches = data[1];
    products = data[2];

    addNotification();
});

function addNotification(){

    for (i in notifs){
        
        var main_div = document.createElement('div');
        var container = document.createElement('div');
        var text_div = document.createElement('div');
        var clickable = document.createElement('a');
        var descript_text = document.createElement('h6');
        var product_text = document.createElement('p');
        var batch_text = document.createElement('p');
        var badge = document.createElement('span');

        badge.className = "badge"
        badge.innerHTML = notifs[i].timestmp;
        clickable.href = "#";
        clickable.className = "blue-text text-darken-4"
        container.className = "container";
        main_div.className = "row";
        text_div.className = "col s12 indigo lighten-5";
        descript_text.innerHTML = notifs[i].descript;
        

        var product_id;
        for (x in batches){
            if (batches[x].lot_no == notifs[i].lot_no){
                product_id = batches[x].product_ID;
                batch_text.innerHTML = "Batch No: "+ batches[x].batch_no;
            }
        }
        for (y in products){
            if (products[y].product_ID = product_id){
                product_text.innerHTML = "Product: "+ products[y].product_name
            }
        }

        descript_text.appendChild(badge);
        text_div.appendChild(descript_text);
        text_div.appendChild(product_text);
        text_div.appendChild(batch_text);
        container.appendChild(text_div);
        clickable.appendChild(container)
        main_div.appendChild(clickable);
        
        notification_bar.appendChild(main_div)

    }

    notif_badge.innerHTML = notifs.length;
    
}