const http = require('http');
const mysql = require("mysql");
const qs = require("querystring");
const url = require('url');
const express = require('express');
const router = express.Router();
const app = express();
const os = require('os');

var ENDPOINT;

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

            console.log(sql);

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
                +qObject.email+"');"
                +" INSERT INTO address(street_number, city, province, country, postal, customer_id) VALUES ('"
                +qObject.street_number+"', '"
                +qObject.city+"', '"
                +qObject.province+"', '"
                +qObject.country+"', '"
                +qObject.postal+"', "
                +"(SELECT LAST_INSERT_ID()));"
                +" INSERT INTO quote(address_id) VALUES ((SELECT LAST_INSERT_ID()));"
                +" SELECT LAST_INSERT_ID();";

            con.query(sql, function (err, result) {
                if (err) {console.log(err); reject(err);}
                qObject.quote_id = result[0];
                console.log("quote #"+qObject.quote_id+" Created");
                resolve(qObject.quote_id);
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
        sql = "DELETE FROM line_item WHERE quote_id = '"+quote_id+"' AND id NOT IN "+line_item_list;
        con.query(sql, function (err, result) {
            if (err) {console.log(err); reject(err);};
            console.log("deleted old line items with result: "+JSON.stringify(result));
            resolve(result);
        });
    });
    
}

//GET METHODS----------------------------------
//GET all quotes
app.get(ENDPOINT+"/quotes", (req, res) => {
    console.log("...GET /quotes");
    
    let sql =    "SELECT q.id, c.first_name, c.last_name, li.cost "
                +"FROM quote q, customer c, address a, "
                +"    (SELECT quote_id, ROUND(SUM(price*quantity), 2) AS cost FROM line_item GROUP BY quote_id) li "
                +"WHERE q.address_id=a.id && li.quote_id=q.id && a.customer_id=c.id;";

    con.query(sql, function (err, result) {
        if (err) {
            console.log(err);
        }

        let messageStr = JSON.stringify(result);
        console.log("Sending Object: "+messageStr);

        res.end(messageStr);
    });
});

//Get quote by ID
app.get(ENDPOINT+"/quotes/:id", (req, res) => {
    console.log("...GET /quotes/{id}");

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
            res.end("[]");
        }
        

        
    });
});


//PUT METHODS-------------------
//update a quote by id
app.put(ENDPOINT+"/quotes/:id", (req, res) => {
    console.log("...PUT /quotes/{id}");

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
                        res.end(qObject.quote_id);
                    }, function(errorText) {

                    });
                }, function(errorText) {

                });
            }, function(errorText){

            });
        }, function(errorText){

        });
    });
});

//POST METHODS------------------
app.post("*", (req, res) => {
    console.log("...is a POST message");
    let body = '';

    req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {

        let post = qs.parse(body);
        // use post['blah'], etc.

        if (post['function'] == "NEWSCORE") {
            console.log("NEWSCORE Message Recieved");

            //res.end("Function: "+post['function']+" qtext: "+post['qtext']+" codeText: "+post['codetext']);

            let sql = "INSERT INTO score(name, score) values ('"+post['name']+"', '"+post['score']+"');";

            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 score record inserted");
                res.end("Submitted!")
            });
        }

        //When retireving the information
        if (post['function'] == "NEWQ") {
            console.log("NEWQ Message Recieved");

            //res.end("Function: "+post['function']+" qtext: "+post['qtext']+" codeText: "+post['codetext']);

            let sql = "INSERT INTO questions(QText, CodeText) values ('"+post['qtext']+"', '"+post['codetext']+"');";

            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 question record inserted");

                sql = "SELECT QID FROM questions WHERE (QID = LAST_INSERT_ID())"

                con.query(sql, function (err, result) {
                    if (err) throw err;
                    Object.keys(result).forEach(function(key) {
                        let row = result[key];
                        res.end(""+row.QID);
                    });
                });
            });
        }

        if (post['function'] == "NEWA") {

            console.log("NEWA Message Recieved");
            if (post['iscorrect'] != "true") {
                post['iscorrect'] = "false";
            }

            let sql = "INSERT INTO answers(QID, AText, IsCorrect) values ('"+post['qid']+"', '"+post['atext']+"', '"+post['iscorrect']+"')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 answer record inserted. aText = "+post['atext']);
                res.end();
            });
        }
    }); 
});

//DELETE METHODS----------------------
//Delete line item
app.delete(ENDPOINT+"/line_items/:id", (req, res) => {
    console.log("...DELETE /line_items/{id}");

    let sql = "DELETE FROM line_item WHERE id = "+req.params.id;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Question deleted");
        res.end();
    });
});
//Delete entire quote + line items
//(temporarily also customer and address too)
app.delete(ENDPOINT+"/quotes/:id", (req, res) => {
    console.log("...DELETE /quotes/{id}");

    let sql =   "DELETE li, q, a, c FROM line_item li "
                +"JOIN quote q ON q.id=li.quote_id "
                +"JOIN address a ON a.id = q.address_id "
                +"JOIN customer c ON c.id = a.customer_id "
                +"WHERE q.id = "+req.params.id+";";

    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Quote Deleted");
        res.end();
    });
});

app.listen(8080, (err) => {
    if (err) throw err;
    console.log("Listening...")
});
