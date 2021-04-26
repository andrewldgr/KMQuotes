const http = require('http');
const mysql = require("mysql");
const qs = require("querystring");
const url = require('url');
const express = require('express');
const session = require('express-session');
var bodyParser = require('body-parser');
const router = express.Router();
const app = express();
app.use(session({
	secret: 'secrets',
	resave: false,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
const os = require('os');

var ENDPOINT;
let endpoint_counts = {
    get_quotes: {method: "GET", endpoint: "/quotes", quantity: 0},
    get_quote_id: {method: "GET", endpoint: "/quotes/{id}", quantity: 0},
    get_admin: {method: "GET", endpoint: "/admin", quantity: 0},
    put_quote_id: {method: "PUT", endpoint: "/quotes/{id}", quantity: 0},
    post_login: {method: "POST", endpoint: "/login", quantity: 0},
    post_quotes: {method: "POST", endpoint: "/quotes", quantity: 0},
    delete_line_item_id: {method: "DELETE", endpoint: "/line_items/{id}", quantity: 0},
    delete_quote_id: {method: "DELETE", endpoint: "/quotes/{id}", quantity: 0},
    get_logout: {method: "GET", endpoint: "/logout", quantity: 0}
};

let totally_insecure_session = {};

//We don't have to change endpoint address manually for deployment
if(os.hostname().indexOf("local") > -1){
  ENDPOINT = "";
  console.log("Localhost Server");
} else {
  ENDPOINT = "/kmquotes/api/v1";
  console.log("Remote Server");
}

const con = mysql.createConnection({
    host: "localhost",
    user: "mandrewn_kmquotes_user",
    password: "hAppy$elling",
    database: "mandrewn_kmquotes"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

app.use(function(req, res, next) {
    console.log("Message Recieved");
    res.header('content-type', 'application/json')
    res.header('Access-control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

function checkQuoteExists(quote_id) {
    return new Promise(function(resolve, reject) {

        sql = "SELECT id FROM quote WHERE id = "+quote_id;

        con.query(sql, function (err, result) {
            if (err) {console.log(err); reject(err);}
            
            if(result.length > 0) {
                console.log("quote: "+quote_id+" exists!")
                resolve(true);
            } else {
                console.log("quote: "+quote_id+" does not exist!")
                resolve(false);
            }
        });
    });
}

function insertOrUpdateQuote(qObject, exists) {
    return new Promise(function(resolve, reject) {

        if (exists == true) {

            let sql = "UPDATE customer SET first_name = '"+qObject.first_name
                +"', last_name = '"+qObject.last_name
                +"', phone = '"+qObject.phone
                +"', email = '"+qObject.email
                +"' WHERE id = "+qObject.customer_id+";";

            con.query(sql, function (err, result) {
                if (err) {console.log(err); reject(err);}
                console.log("customer #"+qObject.customer_id+" Updated");

                sql = "UPDATE address SET street_number = '"+qObject.street_number
                +"', city = '"+qObject.city
                +"', province = '"+qObject.province
                +"', postal = '"+qObject.postal
                +"', country = '"+qObject.country
                +"' WHERE id = "+qObject.address_id+";";

                con.query(sql, function (err, result) {
                    if (err) {console.log(err); reject(err);}
                    console.log("address #"+qObject.address_id+" Updated");
                    resolve(qObject.quote_id);
                });
            });        
    
        } else {
            let sql = "INSERT INTO customer(first_name, last_name, phone, email) values ('"
                +qObject.first_name+"', '"
                +qObject.last_name+"', '"
                +qObject.phone+"', '"
                +qObject.email+"');";

            con.query(sql, function (err, result) {
                if (err) {console.log(err); reject(err);}

                sql = "INSERT INTO address(street_number, city, province, country, postal, customer_id) VALUES ('"
                    +qObject.street_number+"', '"
                    +qObject.city+"', '"
                    +qObject.province+"', '"
                    +qObject.country+"', '"
                    +qObject.postal+"', "
                    +"(SELECT LAST_INSERT_ID()));";

                con.query(sql, function (err, result) {
                    if (err) {console.log(err); reject(err);}

                    sql = "INSERT INTO quote(address_id) VALUES ((SELECT LAST_INSERT_ID()));"

                    con.query(sql, function (err, result) {
                        if (err) {console.log(err); reject(err);}

                        sql = "SELECT LAST_INSERT_ID() AS id;";

                        con.query(sql, function (err, result) {
                            if (err) {console.log(err); reject(err);}

                            if (result.length > 0) {
                                qObject.quote_id = result[0].id;
                                console.log("quote #"+qObject.quote_id+" Created");
                                resolve(qObject.quote_id);
                            }
                        });
                    });
                });
            });
        }
    });
}

function checkLineItemExists(line_item_id, i) {
    return new Promise (function(resolve, reject) {

        sql = "SELECT id FROM line_item WHERE id = "+line_item_id;

        con.query(sql, function (err, result) {
            if (err) {console.log(err); reject(err);}
            
            if(result.length > 0) {
                console.log("line item: "+line_item_id+" exists!")
                resolve([true, i]);
            } else {
                console.log("line item: "+line_item_id+" does not exist!")
                resolve([false, i]);
            }
        });
    });
}

function insertOrUpdateLineItem(liObject, result) {
    return new Promise(function(resolve, reject) {

        if (result == true) {
    
            let sql = "UPDATE line_item SET quote_id = "+liObject.quote_id
            +", title = '"+liObject.title
            +"', description = '"+liObject.description
            +"', quantity = "+liObject.quantity
            +", price = "+liObject.price
            +" WHERE id = "+liObject.line_item_id;

            con.query(sql, function (err, result) {
                if (err) reject(err);
                console.log("1 line_item record updated.");
                resolve(liObject.line_item_id);
            });        
    
        } else {
            let sql = "INSERT INTO line_item(quote_id, title, description, quantity, price) values ("
                +liObject.quote_id+", '"
                +liObject.title+"', '"
                +liObject.description+"', '"
                +liObject.quantity+"', "
                +liObject.price+");";
                

            con.query(sql, function (err, result) {
                if (err) {console.log(err); reject(err);}

                sql = "SELECT LAST_INSERT_ID() AS id;";
                con.query(sql, function (err, result) {
                    if (err) {console.log(err); reject(err);}
                    liObject.line_item_id = result[0].id;
                    console.log("1 line_item record created with id: "+liObject.line_item_id);
                    resolve(liObject.line_item_id);
                });
            });
        }
    });
}

function deleteOtherLineItems(line_item_list, quote_id) {
    return new Promise(function(resolve, reject) {
        if (line_item_list == "()") {
            resolve(undefined);
        } else {
            sql = "DELETE FROM line_item WHERE quote_id = '"+quote_id+"' AND id NOT IN "+line_item_list;
            con.query(sql, function (err, result) {
            if (err) {console.log(err); reject(err);};
            console.log("deleted old line items with result: "+JSON.stringify(result));
            resolve(result);
        });
        }
    });
    
}

//GET METHODS----------------------------------
//GET all quotes
app.get(ENDPOINT+"/quotes", (req, res) => {
    console.log("...GET /quotes");
    endpoint_counts.get_quotes.quantity += 1;
    
    let sql =    "SELECT q.id, c.first_name, c.last_name "
                +"FROM quote q, customer c, address a "
                +"WHERE q.address_id=a.id && a.customer_id=c.id;";

    con.query(sql, function (err, result) {
        if (err) {
            console.log(err);
        }
        let qArr = result;
        sql = "SELECT quote_id, ROUND(SUM(price*quantity), 2) AS cost FROM line_item GROUP BY quote_id;";
        con.query(sql, function (err, result) {
            if (err) {
                console.log(err);
            }

            for (i=0; i < qArr.length; i++) {
                qArr[i].cost = 0;
                for (j=0; j < result.length; j++) {
                    if (qArr[i].id == result[j].quote_id) {
                        qArr[i].cost = result[j].cost;
                    }
                }
            }
            let messageStr = JSON.stringify(qArr);
            console.log("Sending Object: "+messageStr);

            res.end(messageStr);
        });
    });
});

//Get quote by ID
app.get(ENDPOINT+"/quotes/:id", (req, res) => {
    console.log("...GET /quotes/{id}");
    endpoint_counts.get_quote_id.quantity += 1;

    let sql =    "SELECT q.id AS quote_id, c.id AS customer_id, a.id AS address_id, first_name, last_name, phone, email, street_number, city, province, country, postal "
                +"FROM customer c, address a, quote q "
                +"WHERE q.address_id=a.id && a.customer_id=c.id && q.id="+req.params.id;

    con.query(sql, function (err, result) {
        if (err) {console.log(err);}

        if (result.length > 0){
            let quoteObj = {};
            quoteObj = result[0];
            quoteObj.line_items = new Array();

            sql =    "SELECT li.id AS line_item_id, title, description, quantity, price "
                    +"FROM line_item li, quote q "
                    +"WHERE li.quote_id=q.id && q.id="+req.params.id;
            
            con.query(sql, function (err, result) {
                if (err) {console.log(err);}

                quoteObj.line_items = result;
                let messageStr = JSON.stringify(quoteObj);
                console.log("Sending Object: "+messageStr);

                res.end(messageStr);
            });
        } else {
            console.log("quote id does not exist!")
            res.status(400).end("Quote id does not exist.");
        }
    });
});

//log out
app.get(ENDPOINT+'/logout', function (req, res) {
    endpoint_counts.get_logout.quantity += 1;

    totally_insecure_session.loggedin = false;
    console.log("logged out!");
    res.send("logout success!");
    res.end();
});

//Get admin stuff
app.get(ENDPOINT+'/admin', function(req, res) {
    console.log("...GET /admin");
    endpoint_counts.get_admin.quantity += 1;

    if (totally_insecure_session.loggedin == true) {
        res.send(JSON.stringify(endpoint_counts));
        res.end();
    } else {
        console.log("tried to view restricted content without authentication");
        res.status(401).end("You must be loggen in to view this content!");
    }
    

});

//POST METHODS------------------
//logging in
app.post(ENDPOINT+"/login", function(req, res) {
    console.log("...POST /login");
    endpoint_counts.post_login.quantity += 1;

    let body = '';

    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        loginObject = JSON.parse(body);

        var username = loginObject.username;
        var password = loginObject.password;
        if (username && password) {
            con.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(err, results, fields) {
                if (err) {console.log(err); reject(err);}
                if (results.length > 0) {
                    console.log("logged in successfully!");
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.save();
                    totally_insecure_session = req.session;
                    res.send(username);
                    res.end();
                } else {
                    console.log("Invalid Credentials Recieved");
                    res.status(401).end("Invalid Username or Password");
                }			
            });
        } else {
            console.log("Username / Password not recieved");
            res.status(400).end("Please Enter a Username and Password");
        }
    }); 
});

//creating new quote
app.post(ENDPOINT+"/quotes", (req, res) => {
    console.log("...is a POST message");
    endpoint_counts.post_quotes.quantity += 1;

    let body = '';

    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        console.log("data recieved: "+body);
        let qObject = JSON.parse(body);

        checkQuoteExists(qObject.quote_id)
        .then( function(resolveText){

            insertOrUpdateQuote(qObject, resolveText)
            .then( function(resolveText){

                //Delete old line items
                let line_item_id_list = "(";
                for (i=0;i < qObject.line_items.length; i++) {

                    //for processing in later promises
                    qObject.line_items[i].quote_id = qObject.quote_id;

                    //Build a list of line items we are changing
                    if (i == 0) {
                        line_item_id_list += qObject.line_items[i].line_item_id;
                    } else {
                        line_item_id_list += ", "+qObject.line_items[i].line_item_id;
                    }
                }
                line_item_id_list += ")";
                deleteOtherLineItems(line_item_id_list, qObject.quote_id)
                .then(function(resolveText) {

                    let lineItemPromises = [];
                    for (i=0;i < qObject.line_items.length; i++) {

                        checkLineItemExists(qObject.line_items[i].line_item_id, i)
                        .then( function(resolveText) {

                            let result = resolveText[0];
                            let i = resolveText[1];

                            lineItemPromises[i] = insertOrUpdateLineItem(qObject.line_items[i], result)
                            .then( function(resolveText) {
                                
                            }, function(errorText) {

                            });
                        }, function(errorText) {

                        });
                    }

                    //end communication once all line items finished.
                    Promise.all(lineItemPromises)
                    .then ( function(resolveText) {
                        res.end(JSON.stringify(qObject.quote_id));
                    }, function(errorText) {

                    });
                }, function(errorText) {

                });
            }, function(errorText){
                console.log("Unable to insert or update quote");
                res.status(400).end(errorText);
            });
        }, function(errorText){

        });
    }); 
});

//PUT METHODS-------------------
//update a quote by id
app.put(ENDPOINT+"/quotes/:id", (req, res) => {
    console.log("...PUT /quotes/{id}");
    endpoint_counts.put_quote_id.quantity += 1;

    let body = '';

    req.on('data', function (data) {
        body += data;

        // Too much PUT data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        console.log("data recieved: "+body);
        let qObject = JSON.parse(body);

        checkQuoteExists(qObject.quote_id)
        .then( function(resolveText){

            insertOrUpdateQuote(qObject, resolveText)
            .then( function(resolveText){

                //Delete old line items
                let line_item_id_list = "(";
                for (i=0;i < qObject.line_items.length; i++) {

                    //for processing in later promises
                    qObject.line_items[i].quote_id = qObject.quote_id;

                    //Build a list of line items we are changing
                    if (i == 0) {
                        line_item_id_list += qObject.line_items[i].line_item_id;
                    } else {
                        line_item_id_list += ", "+qObject.line_items[i].line_item_id;
                    }
                }
                line_item_id_list += ")";
                deleteOtherLineItems(line_item_id_list, qObject.quote_id)
                .then(function(resolveText) {

                    let lineItemPromises = [];
                    for (i=0;i < qObject.line_items.length; i++) {

                        checkLineItemExists(qObject.line_items[i].line_item_id, i)
                        .then( function(resolveText) {

                            let result = resolveText[0];
                            let i = resolveText[1];

                            lineItemPromises[i] = insertOrUpdateLineItem(qObject.line_items[i], result)
                            .then( function(resolveText) {
                                
                            }, function(errorText) {

                            });
                        }, function(errorText) {

                        });
                    }

                    //end communication once all line items finished.
                    Promise.all(lineItemPromises)
                    .then ( function(resolveText) {
                        res.end(JSON.stringify(qObject.quote_id));
                    }, function(errorText) {

                    });
                }, function(errorText) {

                });
            }, function(errorText){
                console.log("Unable to insert or update quote");
                res.status(400).end(errorText);
            });
        }, function(errorText){

        });
    });
});

//DELETE METHODS----------------------
//Delete line item
app.delete(ENDPOINT+"/line_items/:id", (req, res) => {
    console.log("...DELETE /line_items/{id}");
    endpoint_counts.delete_line_item_id.quantity += 1;

    let sql = "DELETE FROM line_item WHERE id = "+req.params.id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("line item deleted");
        res.end();
    });
});
//Delete entire quote + line items
//(temporarily also customer and address too)
app.delete(ENDPOINT+"/quotes/:id", (req, res) => {
    console.log("...DELETE /quotes/{id}");
    endpoint_counts.delete_quote_id.quantity += 1;

    let sql =   "DELETE li, q, a, c FROM line_item li "
                +"JOIN quote q ON q.id=li.quote_id "
                +"JOIN address a ON a.id = q.address_id "
                +"JOIN customer c ON c.id = a.customer_id "
                +"WHERE q.id = "+req.params.id+";";

    con.query(sql, function (err, result) {
        if (err) throw err;

        //have to do it twice for the edge cases with quotes that have no line items
        let sql =   "DELETE q, a, c FROM quote q "
                +"JOIN address a ON a.id = q.address_id "
                +"JOIN customer c ON c.id = a.customer_id "
                +"WHERE q.id = "+req.params.id+";";

        con.query(sql, function (err, result) {
            if (err) throw err;

            console.log("Quote Deleted");
            res.end();

        });
    });
});

app.listen(8080, (err) => {
    if (err) throw err;
    console.log("Listening...")
});
