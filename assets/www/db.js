var db;
var name;
var selectedId;

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}
function openDB() {
    db = window.openDatabase("shop", "1.0", "PhoneGap", 200000);
}

function init() {
	loadList();
}

function loadList() {
	openDB();
	db.transaction(createTable,errorCB,successCB);
}


function createTable(tx) {
	var query="CREATE TABLE IF NOT EXISTS Shops(id INTEGER PRIMARY KEY, Name TEXT NOT NULL UNIQUE, Url TEXT NOT NULL, Pin TEXT)";
	tx.executeSql(query);
	
	query="CREATE TABLE IF NOT EXISTS Orders("+
	"id INTEGER PRIMARY KEY, "+
	"orderId INT NOT NULL UNIQUE, "+
	"customerName TEXT, "+
	"customerStAddress TEXT, "+
	"customerCity TEXT, "+
	"customerPostcode TEXT, "+
	"customerCountry TEXT, "+
	"customerTelephone TEXT, "+
	"customerEmail TEXT, "+
	"deliveryAddress TEXT, "+
	"deliveryMethod TEXT, "+
	"paymentMethod TEXT, "+
	"datePurchased TEXT, "+
	"orderStatus TEXT, "+
	"currency TEXT, "+
	"finalPrice TEXT, "+
	"additionalInfo TEXT "+
	")";
	tx.executeSql(query);
	
	query="CREATE TABLE IF NOT EXISTS Products("+
	"id INTEGER PRIMARY KEY, "+
	"orderId INTEGER NOT NULL, "+
	"productName TEXT NOT NULL, "+
	"productPrice TEXT NOT NULL, "+
	"productQuantity TEXT NOT NULL"+
	")";
	tx.executeSql(query);
}

function drop() {
    openDB();
    db.transaction(dropTable,errorCB);
    loadList();
    deleteShopSettings();
}

function dropTable(tx) {
	var query="DROP TABLE Shops";
	tx.executeSql(query);
	var query="DROP TABLE Orders";
	tx.executeSql(query);
	var query="DROP TABLE Products";
	tx.executeSql(query);
}

function dropShop(delShop) {
	openDB();
	name=delShop;
	db.transaction(dropTableShop,errorCB);
	loadList();
}

function dropTableShop(tx) {
	var query="DELETE FROM Shops WHERE Name='"+name+"'";
	tx.executeSql(query);
}

function addShop(newShop) {
    openDB();
    name = newShop;
    db.transaction(findShop,errorCB);
    loadList();
}

function findShop(tx) {
	var query="SELECT * FROM Shops WHERE Name='"+name+"'";
	tx.executeSql(query, [], editShop, errorCB);
}

function editShop(tx, result) {	
	var len = result.rows.length;
	
	if(len < 1) {
		var query = "";
		query="INSERT INTO Shops VALUES (null, '"+name+"', '"+ $('#'+name+'address').val()+"', '"+$('#'+name+'pin').val()+"')";
		tx.executeSql(query);
	}
	else{
		var query = "";
		query="Update Shops SET Url = '"+ $('#'+name+'address').val()+"', Pin = '"+$('#'+name+'pin').val()+"' WHERE Name = '"+name+"'";
		tx.executeSql(query);
	}
}

function errorCB(tx, err) {
    alert("DB error: " + err);
}

function successCB(tx, result) {
	db.transaction(queryDB,errorCB);
}

function queryDB(tx) {
	var query="SELECT * FROM Shops";
	tx.executeSql(query, [], showList, errorCB);
	tx.executeSql(query, [], showEdit, errorCB);
}

function showList(tx, result) {
		var storeList = $("#mainContentList");	
		storeList.empty();
				
		var len = result.rows.length;
		if(len < 1)
			storeList.append(
							'<li><a href="#newShop">'+
							'<table><tr><td>'+
							'<img src="images/ustawienia.png" width=60 height=60>'+
							'</td><td>'+
							'<h2>Configure new shop</h2>'+
							'<p>Click here to start and add shop</p>'+
							'</tr></table>'+
							'</a></li>');
									
		$.each(result.rows,function(index){
			var row = result.rows.item(index);
			storeList.append(
							'<li><a href="#order" onClick="loadOrderList2('+"'"+row['Url']+"','"+row['Pin']+"'"+');">'+
							'<table><tr><td>'+
							'<img src="images/'+row['Name']+'.png" width=60 height=60>'+
							'</td><td>'+
							'<h2>'+row['Name']+'</h2>'+
							'<p>'+row['Url']+'</p>'+
							'</tr></table>'+
							'</a></li>');
		});

		storeList.listview( "refresh" );
}

function addOrder(orderId, customerName, customerStAddress, customerCity, 
					customerPostcode, customerCountry, customerTelephone, customerEmail,
					deliveryAddress, deliveryMethod, paymentMethod, datePurchased,
					orderStatus, currency, finalPrice, additionalInfo) {
	
	openDB();
	
	db.transaction(function(tx) {
		var query="INSERT INTO Orders VALUES (null, '"+orderId+"', '"+escape(customerName)+"', '"+escape(customerStAddress)+"', '"+
		  customerCity+"', '"+customerPostcode+"', '"+customerCountry+"', '"+customerTelephone+"', '"+
		  customerEmail+"', '"+escape(deliveryAddress)+"', '"+escape(deliveryMethod)+"', '"+escape(paymentMethod)+"', '"+
		  datePurchased+"', '"+orderStatus+"', '"+currency+"', '"+finalPrice+"', '"+additionalInfo+"')";

		tx.executeSql(query);
	},errorCB);
}

function clearOrders() {
	openDB();
	db.transaction(clearOrdersQuery,errorCB);
}

function clearOrdersQuery(tx) {
	var query="DELETE FROM Orders";	
	tx.executeSql(query);
}

function addProduct(productOrderId, productName, productPrice, productQuantity) {	

	openDB();
	db.transaction(function(tx) {
		var query="INSERT INTO Products VALUES (null, '"+productOrderId+"', '"+escape(productName)+"', '"+productPrice+"', '"+productQuantity+"')";	
		tx.executeSql(query);
	},errorCB);
}

function clearProducts() {
	openDB();
	db.transaction(clearProductsQuery,errorCB);
}

function clearProductsQuery(tx) {
	var query="DELETE FROM Products";	
	tx.executeSql(query);
}

function showOrders2() {
	openDB();
	db.transaction(showOrders2Query,errorCB);
}

function showOrders2Query(tx) {
	var query="SELECT * FROM Orders";
	tx.executeSql(query, [], showOrdersList, errorCB);
}

function loadOrderDetailsList2(newId) {
	selectedId = newId;
	db.transaction(loadOrderDetailsList2Query,errorCB);
}

function loadOrderDetailsList2Query(tx) {
	var query="SELECT o.orderId, "+
	"o.customerName, "+
	"o.customerStAddress, "+
	"o.customerCity, "+
	"o.customerPostcode, "+
	"o.customerCountry, "+
	"o.customerTelephone, "+
	"o.customerEmail, "+
	"o.deliveryAddress, "+
	"o.deliveryMethod, "+
	"o.paymentMethod, "+
	"o.datePurchased, "+
	"o.orderStatus, "+
	"o.currency, "+
	"o.finalPrice, "+
	"o.additionalInfo, "+
	"p.productName, "+
	"p.productPrice, "+
	"p.productQuantity "+
	"FROM Orders o, Products p WHERE o.orderId=p.orderId AND o.id='"+selectedId+"'";
	tx.executeSql(query, [], showDetailList, errorCB);
}

function showOrdersList(tx, result) {
	var ordersList = $("#orderContentList");
	
	var len = result.rows.length;
	if(len < 1)
		ordersList.append(
				'<li>'+
				'<a href="#order"><h3>There are no new orders</h3>'+
			    '</a></li>'
				);
	$.each(result.rows,function(index){
		var row = result.rows.item(index);
		ordersList.append(
				'<li>'+
					'<a href="#orderdetails" onClick="loadOrderDetailsList2('+"'"+row['id']+"'"+');">'+
					'<p>'+row['datePurchased']+'</p>'+
					'<h3>'+unescape(row['customerName'])+'</h3>'+
					'<p><strong>Price: '+roundNumber(row['finalPrice'],2)+' '+row['currency']+'</strong></p>'+
					'<p>Order status: '+row['orderStatus']+'</p>'+
				'</a></li>'
			   );
	});
	
	ordersList.listview( "refresh" );
	$('#spinner').hide();
	$('#refresh').show();
}

function showDetailList(tx, result) {
    var productList = $("#orderDetailsContentList");
    var details = $("#divDetail");
    var customer = $("#divCustomer");
    productList.empty();
    details.empty();
    customer.empty();
    var row = result.rows.item(0);
    customer.append(
                    '<h3>Customer:</h3>'+
                    '<p>Name: '+unescape(row['customerName'])+'</p>'+
                    '<p>Address: '+unescape(row['customerStAddress'])+'</p>'+
                    '<p>City: '+row['customerCity']+'</p>'+
                    '<p>Postcode: '+row['customerPostcode']+'</p>'+
                    '<p>Country: '+row['customerCountry']+'</p>'+
                    '<p>Telephone: '+row['customerTelephone']+'</p>'+
                    '<p>E-mail: '+row['customerEmail']+'</p>'
                    
    );
    details.append(
            '<h3>Order details:</h3>'+
            '<p>Date purchased: '+row['datePurchased']+'</p>'+
            '<p>Order status: '+row['orderStatus']+'</p>'+
            '<p>Delivery address: '+unescape(row['deliveryAddress'])+'</p>'+
            '<p>Delivery method: '+unescape(row['deliveryMethod'])+'</p>'+
            '<p>Final price: '+roundNumber(row['finalPrice'],2)+' '+row['currency']+'</p>'
            
    );
           
    productList.append('<h3>Ordered products:</h3>');
    
    $.each(result.rows,function(index){
            row = result.rows.item(index);
            productList.append(
                            '<li>'+
                                    '<h3>'+unescape(row['productName'])+'</h3>'+
                                    '<p><strong>Price: '+roundNumber(row['productPrice'],2)+' '+row['currency']+'</strong></p>'+
                                    '<p>Quantity: '+roundNumber(row['productQuantity'],0)+'</p>'+
                            '</li>'
                       );
    });
    
    productList.listview( "refresh" );
    details.listview( "refresh" );
    customer.listview( "refresh" );
}

function showEdit(tx, result) {
	var show = $("#divShopSettings");	
	show.empty();
	
	$.each(result.rows,function(index){
		var row = result.rows.item(index);
		show.append(
			 	'<div data-role="controlgroup" data-type="horizontal" class="row_buttons" id="'+row['Name']+'Settings">'+
					'<div class="ui-block-a"><a href="#edit" id="shop-name" data-role="button" onClick="editShopSettings('+"'"+row['Name']+"','"+row['Url']+"','"+row['Pin']+"'"+');"><img src="images/'+row['Name']+'.png" width=60 height=60></a></div>'+
					'<div class="ui-block-b"><a href="#edit" id="shop-config" data-role="button" onClick="editShopSettings('+"'"+row['Name']+"','"+row['Url']+"','"+row['Pin']+"'"+');"><img src="images/konfiguracja.png" width=60 height=60></a></div>'+
					'<div class="ui-block-c"><a href="#main" id="shop-delete" data-role="button" onClick="deleteShopSettings('+"'"+row['Name']+"'"+');"><img src="images/usun.png" width=60 height=60></a></div>'+
				'</div>'
				);
	});
	show.trigger("create");
}

function editShopSettings(editName, editUrl, editPin) {
	var edit = $("#divEditShop");
	edit.empty();
	var text=	'<h3>'+editName+'</h3><hr/>'+
				'<div data-role="fieldcontain">'+
				'<label for="'+editName+'addressEdit">Shop address:</label>'+
				'<input type="url" name="addressEdit" id="'+editName+'addressEdit" value="'+editUrl+'" placeholder="address" />'+		
				'<br />'+
				'<label for="'+editName+'pinEdit">Pin:</label>'+
				'<input type="password" name="pinEdit" id="'+editName+'pinEdit" value="'+editPin+'" placeholder="pin" />'+
				'</div>'+
				'<fieldset class="ui-grid-a">'+
					'<div class="ui-block-a"><button type="submit" data-theme="a" ><a href="#main" data-role="button" onClick="saveEditShopSettings('+"'"+editName+"'"+');">Save</a></button></div>'+	   
					'<div class="ui-block-b"><button type="submit" data-theme="c"><a href="#settings" data-role="button">Cancel</a></button></div>'+
				'</fieldset>';
	edit.append(text);
	edit.trigger("create");
}

function deleteShopSettings(deleteName) {
	var choice = confirm("Delete selected shop?");
	if(!choice)
		return;
	
	var del = $("#"+deleteName+"Settings");
	del.empty();
	
	dropShop(deleteName);
}

function saveEditShopSettings(saveShop) {
    openDB();
    name = saveShop;
    db.transaction(findEditShop,errorCB);
    loadList();
}

function findEditShop(tx) {
	var query="SELECT * FROM Shops WHERE Name='"+name+"'";
	tx.executeSql(query, [], changeShop, errorCB);
}

function changeShop(tx, result) {
	var query = "";
	query="Update Shops SET Url = '"+ $('#'+name+'addressEdit').val()+"', Pin = '"+$('#'+name+'pinEdit').val()+"' WHERE Name = '"+name+"'";
	tx.executeSql(query);
}