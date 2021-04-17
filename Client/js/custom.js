const SERVER = "http://192.168.1.68:8080";//https://mandrewnator.com/kmquotes/api/v1";

function loadAllQuotes(display_div) {
    areaLoading(display_div);

    retrieveAllQuotes()
    .then( function(resolveText) {
        let qObject = JSON.parse(resolveText);
        displayQuotes(qObject, display_div)
        .then( function(resolveText) {
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

function displayQuotes(qObject, display_div) {
    return new Promise (function(resolve) {
        let displayStr = "";


        for (i=0; i<qObject.length; i++){

            displayStr = 
            '<div class="card bg-light col-sm-12 col-md-12 col-lg-6 col-xl-3 d-inline-block">'
            +'<div class="card-body">'
                +'<h4 class="card-title">'+(qObject[i].name)+'</h4>'
                +'<p class="card-text">Quote #'+qObject[i].id+'</p>'
                +'<p class="card-text">'+qObject[i].address+'</p>'
                +'<a id="q'+i+'EditBtn" class="btn btn-info float-right">Edit Quote</a>'
            +'</div>'
            +'</div>';

            display_div.insertAdjacentHTML('beforeend', displayStr);
        }
        resolve();
    });
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
