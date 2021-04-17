const http = require('http');
const mysql = require("mysql");
const qs = require("querystring");
const url = require('url');
const express = require('express');
const router = express.Router();
const app = express();
const ENDPOINT = "/kmquotes/api/v1";

const con = mysql.createConnection({
    host: "localhost",
    user: "mandrewn_comp351",
    password: "hAppy0ing",
    database: "mandrewn_comp351"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

app.use(function(req, res, next) {
    console.log("Header Created");
    res.header('Access-control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

function checkAIDExists(aID, i) {
    return new Promise (function(resolve, reject) {
        //Check if the Answer ID exists
        sql = "SELECT * FROM answers WHERE AID = '"+aID+"'";

        con.query(sql, function (err, result) {
            if (err) reject(err);
            let qObj = [];
            Object.keys(result).forEach(function(key) {
                let row = result[key];
                qObj.push({"aID": row.AID});
            });
            console.log(qObj['aID']);
            console.log(JSON.stringify(qObj));
            if(JSON.stringify(qObj) !== "[]") {
                resolve([true, i]);
            } else {
                resolve([false, i]);
            }
        });
    });
    
}

//GET METHODS----------------
app.get(ENDPOINT+"/quotes", (req, res) => {
    console.log("...is a GET message");
    //Values
    const q = url.parse(req.url, true);

    /*
    let tempSqlCommand = "DELETE FROM chatApp WHERE id > 100";

    con.query(tempSqlCommand, function (err, result) {
        if (err) {
            console.log(err);
        }
        res.end("Entries Deleted!");
    });
    */
    
    let sql = "SELECT * FROM quotes";
      
    console.log("about to do something");
    con.query(sql, function (err, result) {
        if (err) {
            console.log(err);
        }
        
        let quotesObj = [];

        Object.keys(result).forEach(function(key) {
            let row = result[key];
            quotesObj.push({"id": row.id, "name": row.name, "address": row.address})
        });
        let messageStr = JSON.stringify(quotesObj);
        console.log("Sending Object: "+messageStr);

        res.end(messageStr);
        

    });


    if (q.query['function'] == "GETINFO") {
        console.log("GETINFO message recieved");

        let sql = "SELECT * FROM questions";

        con.query(sql, function (err, result) {
            if (err) throw err;

            let qObj = [];

            Object.keys(result).forEach(function(key) {
                let row = result[key];
                qObj.push({"qID": row.QID, "qText": row.QText, "codeText": row.CodeText})
            });
            let messageStr = JSON.stringify(Object.assign({}, qObj));
            console.log("Sending Object: "+messageStr);

            res.end(messageStr);

        });

    }
    if (q.query['function'] == "GETANSWERS") {
        console.log("GETANSWERS message recieved");

        let sql = "SELECT * FROM answers WHERE QID = "+q.query['qid'];

        con.query(sql, function (err, result) {
            if (err) throw err;

            let aObj = [];
            Object.keys(result).forEach(function(key) {
                let row = result[key];
                aObj.push({"aID": row.AID, "aText": row.AText, "isCorrect": row.IsCorrect});
            });
            let messageStr = JSON.stringify(Object.assign({}, aObj));
            console.log("Sending Object: "+messageStr);

            res.end(messageStr);
        });
    }

    if (q.query['function'] == "GETALLINFO") {
        console.log("GETALLINFO message recieved");

        let sql = "SELECT * FROM questions";

        con.query(sql, function (err, result) {
            if (err) throw err;

            let qObj = [];

            Object.keys(result).forEach(function(qkey) {
                let qrow = result[qkey];
                qObj.push({"qID": qrow.QID, "qText": qrow.QText, "codeText": qrow.CodeText, "answers": new Array()})
            });
            let sql = "SELECT * FROM answers";

            con.query(sql, function (err, result) {
                if (err) throw err;

                Object.keys(result).forEach(function(akey) {
                    let arow = result[akey];
                    for (i=0; i < qObj.length; i++) {
                        if (qObj[i].qID == arow.QID) {
                            qObj[i].answers.push({"aID": arow.AID, "aText": arow.AText, "isCorrect": arow.IsCorrect});
                        }
                    }
                });
                let messageStr = JSON.stringify(Object.assign({}, qObj));
                console.log("Sending Object: "+messageStr);

                res.end(messageStr);
            });
            
        });
    }
});

//PUT METHODS-------------------
app.put("*", (req, res) => {
    console.log("...is a PUT message");

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
        let post = JSON.parse(body);

        if (post['function'] == "UPDATEQ") {
            console.log("UPDATEQ Message Recieved");

            let sql = "UPDATE questions SET QText = '"+post['qtext']+"', CodeText = '"+post['codetext']+"' WHERE QID = '"+post['qid']+"'";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 question record updated. qText = "+post['qtext']);
                res.end();
            });
        }

        if (post['function'] == "UPDATEANS") {
            console.log("UPDATEANS Message Recieved");

            sql = "UPDATE answers SET QID = '"+post['qid']+"', AText = '"+post['atext']+"', IsCorrect = '"+post['iscorrect']+"' WHERE AID = '"+post['aid']+"'";
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 answer record updated. aText = "+post['atext']);
            });

            res.end();
        }

        if (post['function'] == "REPLACEANSWERS") {
            console.log("REPLCEANSWERS Message Recieved:");

            let aIDList = "(";
            let sql = "";
            for (i=0;i < post['aid'].length; i++) {

                if (post['iscorrect'][i] != "true") {
                    post['iscorrect'][i] = "false";
                }

                if (i > 0) {
                    aIDList += ", ";
                }
                aIDList += post['aid'][i];

                checkAIDExists(post['aid'][i], i)
                .then( function(resolveText) {
                    if (resolveText[0] == true) {
                        console.log("aid exists!")
                        sql = "UPDATE answers SET QID = '"+post['qid']+"', AText = '"+post['atext'][resolveText[1]]+"', IsCorrect = '"+post['iscorrect'][resolveText[1]]+"' WHERE AID = '"+post['aid'][resolveText[1]]+"'";
                        console.log("qid: "+post['qid']);
                        console.log("aid: "+post['aid'][resolveText[1]]);
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log("1 answer record updated.");
                        });
                    } else {
                        console.log("aid doesn't exist")
                        sql = "INSERT INTO answers(QID, AText, IsCorrect) values ('"+post['qid']+"', '"+post['atext'][resolveText[1]]+"', '"+post['iscorrect'][resolveText[1]]+"')";
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log("1 answer record inserted.");
                            res.end();
                        });
                    }
                    
                }, function(errorText) {
                    console.log(errorText);
                });

                
            }
            aIDList += ")";

            console.log(aIDList);
            //delete any answers associated with the questions, where we aren't updating them
            //according to semantics, a PUT request should only replace the full list of answers,
            //and not just the ones provided
            sql = "DELETE FROM answers WHERE QID = "+post['qid']+" AND AID NOT IN "+aIDList;
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("Old Answers deleted");
            });
            

            res.end();
        }
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

//DELETE METHOD----------------------
app.delete("*", (req, res) => {
    console.log("...is a DELETE message");

    let body = '';
    req.on('data', function (data) {
        console.log("...recieved some data");
        body += data;

        // Too much PUT data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            req.socket.destroy();
    });

    req.on('end', function () {
        console.log("...message ending");
        let post = JSON.parse(body);

        //const q = url.parse(req.url, true);

        if (post['function'] == "DELETEQ") {
            console.log("DELETQ Message Recieved");

            let sql = "DELETE FROM questions WHERE QID = "+post['qid'];
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("Question deleted");
            });

            sql = "DELETE FROM answers WHERE QID = "+post['qid'];
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("Answers deleted");
            });
            res.end();
        }
    });
});

app.listen(8080, (err) => {
    if (err) throw err;
    console.log("Listening...")
});
