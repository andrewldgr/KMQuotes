//We don't have to change anything for deployment
var SERVER;
if (window.location.host == "localhost") {
    SERVER = "http://localhost:8080";
} else {
    SERVER = "https://www.mandrewnator.com/kmquotes/api/v1";
}

function loadQuoteForEditing(quote_id, display_div, template_div, line_item_div) {
    areaLoading(display_div);

    retrieveQuote(quote_id)
    .then (function(resolveText) {
        let qObject = JSON.parse(resolveText);
        displayQuoteForEditing(qObject, display_div, template_div, line_item_div)
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

function displayQuoteForEditing(qObject, display_div, template_div, line_item_div) {
    return new Promise (function(resolve) {
        let displayStr = "";

        displayStr = render(template_div.innerHTML, qObject);
        display_div.insertAdjacentHTML('beforeend', displayStr);

        for (i=0; i<qObject.line_items.length; i++){

            displayStr = render(line_item_div.innerHTML, qObject.line_items[i]);
            display_div.insertAdjacentHTML('beforeend', displayStr);
        }

        resolve();
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
            document.getElementById('q'+qObject[i].id+'EditBtn').addEventListener("click", editQuote(qObject[i].id));
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

function editQuote(quote_no) {
    //Curry function as it's invoked inside a loop's click listener
    return function () {
        window.location.href = "edit-quote.html?quote_id="+quote_no;
    }
}

function areaLoading(obj){
    obj.classList.add('disabled');
    var loaderElement = document.createElement("div");
    loaderElement.classList.add('spinner-border');
    obj.insertBefore(loaderElement, obj.childNodes[0]);
}

function areaLoaded(obj){
    loaderElement = findFirstChildByClass(obj, "spinner-border");
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
