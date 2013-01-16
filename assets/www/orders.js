var allegroUrl = "";	//place URL to your Allegro PHP script here
var shoperUrl = "";		//place URL to your Shoper PHP script here
var shopifyUrl = "";	//place URL to your Shopify PHP script here
var shopifyApiKey = "";	//place your Shopify Api Key here
var filename = "";

function checkInternetConnection()
{
	if(navigator.network.connection.type==Connection.UNKNOWN || navigator.network.connection.type==Connection.NONE)
	{
		alert("You don't have an Internet connection!");
		return false;
	}
	return true;
}

function saveOrders(data) {
	clearProducts();
	clearOrders();
	var ordersList = $("#orderContentList");
	ordersList.empty();
	
	$.each(data.results, function(i,position){  
		var id = position.order_id;
		
		addOrder(id, position.customer_name, position.customer_st_address, position.customer_city, position.customer_postcode,
				  position.customer_country, position.customer_telephone, position.customer_email, position.delivery_address,
				  position.delivery_method, position.payment_method, position.date_purchased, position.order_status, position.currency,
				  position.final_price, position.additional_info);
		
	     $.each(position.products, function(i2,position2){
	    	 addProduct(id, position2.product_name, position2.product_price, position2.product_quantity);
	     });
	});
	showOrders2();
}

function loadOrderList2(url, pin) {
	var ordersList = $("#orderContentList");
	ordersList.empty();
	
	var refresh = $("#refresh");	
	refresh.empty();
	refresh.hide();
	refresh.append('<a href="#order" onClick="loadOrderList2('+"'"+url+"','"+pin+"'"+');" data-icon="refresh" class="ui-btn ui-btn-icon-right ui-btn-hover-a"><span class="ui-btn-inner"><span class="ui-btn-text">Refresh</span><span class="ui-icon ui-icon-gear ui-icon-shadow"></span></span></a>');
		
	if (checkInternetConnection()) {
		$('#spinner').show();
		
		$.get(url+"/generate_order_list.php", function(data){      
			filename = "_temp_mobile_"+hex_md5(pin+data)+".php";
			jsonForOrders2(url, filename);
		});
	} else {
		return;
	}
}

function jsonForOrders2(url, filename) {
	$.post(url+"/"+filename+"/?jsoncallback=?", function(data){   
		saveOrders2(data);
	}, "json");
}

function saveOrders2(data) {
	clearProducts();
	clearOrders();
	
	$.each(data.result, function(i,position){   
		 addOrder(position.order_id, position.customer_name, position.customer_st_address, position.customer_city, position.customer_postcode,
				  position.customer_country, position.customer_telephone, position.customer_email, position.delivery_address,
				  position.delivery_method, position.payment_method, position.date_purchased, position.order_status, position.currency,
				  position.final_price, position.additional_info)
				  
	     $.each(position.products, function(i2,position2){
	    	 addProduct(position.order_id, position2.product_name, position2.product_price, position2.product_quantity)
	     });
	});
	
	showOrders2();
}