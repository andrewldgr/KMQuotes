//We don't have to change anything for deployment
var SERVER;
if (window.location.host == "localhost") {
    SERVER = "http://localhost:8080";
} else {
    SERVER = "https://www.mandrewnator.com/kmquotes/api/v1";
}

function deleteQuoteCurry(quote_id){
    return function() {
        areaLoading(this, "sm");

        deleteQuote(quote_id)
        .then( function(resolveText) {
            window.location.href = "view-quotes.html";
        }, function(errorText) {
            areaLoaded(this);
            alert(errorText);
        });
    }  
}

function deleteQuote(quote_id){
    return new Promise (function(resolve, reject) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
                resolve(xmlHttp.responseText);
            } else if (xmlHttp.status >= 300) {
                reject("Could Not Delete Quote");
            } else if (xmlHttp.readyState == 4 && xmlHttp.status == 0){
                reject("Could Not Connect to Server");
            }
        }
        xmlHttp.open("DELETE", SERVER+"/quotes/"+quote_id, true);
        xmlHttp.send("");
    });
}

function addEmptyLineItem(displayDiv, template) {

        let liObject = {
            line_item_id: 0,
            title: "",
            description: "",
            quantity: 1,
            price: 0.00
        };

        var deleteBtn = {};

        let new_div = document.createElement('div');
        new_div.innerHTML = render(template.innerHTML, liObject);
        displayDiv.appendChild(new_div);

        var deleteBtnArr = document.querySelectorAll('[name="deleteLineItemBtn"]');
        if (deleteBtnArr.length > 0) {
            console.log(deleteBtnArr.length);
            deleteBtn = deleteBtnArr[deleteBtnArr.length-1];
            deleteBtn.addEventListener("click", deleteLineItemCurry(liObject.line_item_id, new_div));
        }
}

function saveQuote() {
    //Curry Function
    return function () {

        areaLoading(this, "sm");

        //Gather Information
        let qObject = {};
        qObject.quote_id = document.querySelector('[name="quote_id"]').value;
        qObject.customer_id = document.querySelector('[name="customer_id"]').value;
        qObject.address_id = document.querySelector('[name="address_id"]').value;
        qObject.first_name = document.querySelector('[name="first_name"]').value;
        qObject.last_name = document.querySelector('[name="last_name"]').value;
        qObject.phone = document.querySelector('[name="phone"]').value;
        qObject.email = document.querySelector('[name="email"]').value;
        qObject.street_number = document.querySelector('[name="street_number"]').value;
        qObject.city = document.querySelector('[name="city"]').value;
        qObject.province = document.querySelector('[name="province"]').value;
        qObject.postal = document.querySelector('[name="postal"]').value;
        qObject.country = document.querySelector('[name="country"]').value;

        //Line Items
        qObject.line_items = new Array();
        let all_line_item_ids = document.querySelectorAll('[name="line_item_id"]');
        let all_line_item_titles = document.querySelectorAll('[name="title"]');
        let all_line_item_descriptions = document.querySelectorAll('[name="description"]');
        let all_line_item_quantities = document.querySelectorAll('[name="quantity"]');
        let all_line_item_prices = document.querySelectorAll('[name="price"]');

        //Construct Object
        for (let i=1; i < all_line_item_ids.length; i++) {
            j = i-1;
            qObject.line_items[j] = {};
            qObject.line_items[j].line_item_id = all_line_item_ids[i].value;
            qObject.line_items[j].title = all_line_item_titles[i].value;
            qObject.line_items[j].description = all_line_item_descriptions[i].value;
            qObject.line_items[j].quantity = all_line_item_quantities[i].value;
            qObject.line_items[j].price = all_line_item_prices[i].value;
        }

        sendQuote(qObject)
        .then (function(resolveText) {
            viewQuote(resolveText);
        }, function(errorText) {

        });

    }
}

function sendQuote(qObject) {
    return new Promise(function(resolve, reject) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
                resolve(xmlHttp.responseText);
            } else if (xmlHttp.status >= 300) {
                reject("Error Recieved");
            } else if (xmlHttp.readyState == 4 && xmlHttp.status == 0){
                reject("Could Not Connect to Server");
            }
        }
        xmlHttp.open("PUT", SERVER+"/quotes/"+qObject.quote_id, true);
        xmlHttp.send(JSON.stringify(qObject));
    });
}

function loadQuote(quote_id, display_div, line_item_template_div) {
    areaLoading(display_div);

    retrieveQuote(quote_id)
    .then (function(resolveText) {
        let qObject = JSON.parse(resolveText);
        displayQuote(qObject, display_div, line_item_template_div)
        .then( function() {
            areaLoaded(display_div);
        });
    }, function(errorText) {
        var t = document.createTextNode(errorText);
        display_div.appendChild(t); 
        areaLoaded(display_div);
    });
}

function retrieveQuote(quote_id) {
    return new Promise (function(resolve, reject) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
                resolve(xmlHttp.responseText);
            } else if (xmlHttp.status >= 300) {
                reject("Could Not Retrieve Quote Information");
            } else if (xmlHttp.readyState == 4 && xmlHttp.status == 0){
                reject("Could Not Connect to Server");
            }
        }
        xmlHttp.open("GET", SERVER+"/quotes/"+quote_id, true);
        xmlHttp.send("");
    });
}

function displayQuote(qObject, display_div, line_item_template_div) {
    return new Promise (function(resolve) {

        qObject.quote_total = 0;

        for (i=0; i<qObject.line_items.length; i++){
            //Quick calculation for line item totals
            qObject.line_items[i].line_total = (qObject.line_items[i].quantity*qObject.line_items[i].price)
            qObject.quote_total += qObject.line_items[i].line_total;
        }

        //display the rest of the quote information
        display_div.innerHTML = render(display_div.innerHTML, qObject);
        display_div.classList.remove("template");

        for (i=0; i<qObject.line_items.length; i++){
            //display the line items
            let new_div = document.createElement('div');
            new_div.innerHTML = render(document.getElementById("editLineItemTemplate").innerHTML, qObject.line_items[i]);
            document.getElementById("lineItemDisplayDiv").appendChild(new_div);

            let deleteBtn = document.getElementById('deleteLineItem'+qObject.line_items[i].line_item_id+'Btn');
            if (deleteBtn) {
                deleteBtn.addEventListener("click", deleteLineItemCurry(qObject.line_items[i].line_item_id, new_div));
            }
        }

        resolve();
    });
}

function deleteLineItemCurry(line_item_id, div_to_delete) {
    return function() {

        areaLoading(this);
        deleteLineItem(line_item_id)
        .then( function(resolveText) {
            div_to_delete.remove();
        }, function(errorText) {
            alert(errorText);
            areaLoaded(this);
        });

    }
}

function deleteLineItem(line_item_id) {
    return new Promise (function(resolve, reject) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
                resolve(xmlHttp.responseText);
            } else if (xmlHttp.status >= 300) {
                reject("Could Not Delete Line Item");
            } else if (xmlHttp.readyState == 4 && xmlHttp.status == 0){
                reject("Could Not Connect to Server");
            }
        }
        xmlHttp.open("DELETE", SERVER+"/line_items/"+line_item_id, true);
        xmlHttp.send("");
    });
}

function loadAllQuotes(display_div, template_div) {
    areaLoading(display_div);

    retrieveAllQuotes()
    .then( function(resolveText) {
        let qObject = JSON.parse(resolveText);
        displayQuotes(qObject, display_div, template_div)
        .then( function() {
            areaLoaded(display_div);
        });
    }, function(errorText) {
        var t = document.createTextNode(errorText);
        display_div.appendChild(t); 
        areaLoaded(display_div);
    });
}

function retrieveAllQuotes(){
    return new Promise (function(resolve, reject) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
                resolve(xmlHttp.responseText);
            } else if (xmlHttp.status >= 300) {
                reject("Could Not Retrieve Quotes");
            } else if (xmlHttp.readyState == 4 && xmlHttp.status == 0){
                reject("Could Not Connect to Server");
            }
        }
        xmlHttp.open("GET", SERVER+"/quotes", true);
        xmlHttp.send("");
    });
}

function displayQuotes(qObject, display_div, template_div) {
    return new Promise (function(resolve) {
        let displayStr = "";

        for (i=0; i<qObject.length; i++){

            displayStr = render(template_div.innerHTML, qObject[i]);
            display_div.insertAdjacentHTML('beforeend', displayStr);
            //Use Curry Function to bind values
            document.getElementById('q'+qObject[i].id+'EditBtn').addEventListener("click", viewQuoteCurry(qObject[i].id));
        }
        resolve();
    });
}

function render(template, fillData) {
      
    let renderedData = template;

    Object.keys(fillData).forEach(key => {

        const regex = new RegExp("%"+key+"%", 'g');

        //renderedData = renderedData.split(regex).join(fillData[key]);

        renderedData = renderedData.replace(regex, fillData[key]);
    });

    return renderedData;
}

function editQuote(quote_id) {
    //Curry function as it's invoked inside a loop's click listener
    return function () {
        window.location.href = "edit-quote.html?quote_id="+quote_id;
    }
}

function viewQuote(quote_id) {
    window.location.href = "view-quote.html?quote_id="+quote_id;
}

function viewQuoteCurry(quote_id) {
    return function () {
        window.location.href = "view-quote.html?quote_id="+quote_id;
    }
}

function areaLoading(obj, size="md"){
    obj.classList.add('disabled');
    var loaderElement = document.createElement("div");
    loaderElement.classList.add('loading');
    loaderElement.classList.add('spinner-border');
    if (size == "sm") {
        loaderElement.classList.add('spinner-border-sm');
    }
    obj.insertBefore(loaderElement, obj.childNodes[0]);
}

function areaLoaded(obj){
    loaderElement = findFirstChildByClass(obj, "loading");
    loaderElement.remove();
    obj.classList.remove('disabled');
}

function findFirstChildByClass(element, className) {
    var foundElement = null, found;
    function recurse(element, className, found) {
        for (var i = 0; i < element.childNodes.length && !found; i++) {
            var el = element.childNodes[i];
            var classes = el.className != undefined? el.className.split(" ") : [];
            for (var j = 0, jl = classes.length; j < jl; j++) {
                if (classes[j] == className) {
                    found = true;
                    foundElement = element.childNodes[i];
                    break;
                }
            }
            if(found)
                break;
            recurse(element.childNodes[i], className, found);
        }
    }
    recurse(element, className, false);
    return foundElement;
}
