var express = require('express');
var app = express();

// Database
var fs = require("fs");
var file = "test.db";
var exists = fs.existsSync(file);

if(!exists) {
    console.log("Creating DB file.");
    fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
    if(!exists) {
        db.run("CREATE TABLE Coffees (thing TEXT)");
    }
});

app.get('/test', function (req, res) {
    var c = doSelect("SELECT * FROM Coffees");
    console.log(c);
    res.send(c);
});

app.post('/test', function (req, res) {
    doInsert("INSERT INTO Coffees VALUES (?)", ['Test']);
    res.send('OK');
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

function doQuery(queryFunction, callbackFunction) {
    var output;

    db.serialize(function() {
        output = queryFunction(db, output);
    });

    return output;
}

function doInsert(statement, values) {
    doQuery(function (db) {
        var stmt = db.prepare(statement);
        for (var i = 0; i < values.length; i++) {
            stmt.run(values[i]);
        }
        stmt.finalize();
    });
}

function doSelect(query) {
    doQuery(function (db, output) {
        db.each(query,
            function(err, row) {
                output.push(row);
            },
            function(err, rows) {
                console.log(rows);
                return output;
            }
        );
    });
}

