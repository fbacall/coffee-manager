var express = require('express');
var app = express();

// Database Setup
var fs = require("fs");
var file = "test.db";
var exists = fs.existsSync(file);

// Create db file if it doesn't exist
if(!exists) {
    console.log("Creating DB file.");
    fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

// If we created a db before, need to create the tables now
var TABLES = [
    "CREATE TABLE Coffees (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, date DATETIME DEFAULT CURRENT_TIMESTAMP, unit_price DECIMAL(5,2))",
    "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, card_id VARCHAR(255), name VARCHAR(255))",
    "CREATE TABLE Payments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, date DATETIME DEFAULT CURRENT_TIMESTAMP, amount DECIMAL(5,2))"
];

db.serialize(function() {
    if(!exists) {
        for(var i = 0; i < TABLES.length; i++)
            db.run(TABLES[i]);
    }
});

app.get('/users/:user_id/coffees', function (req, res) {
    var user_id = parseInt(req.params.user_id);
    if(!isNaN(user_id) && user_id > 0) {
        doSelect("SELECT * FROM Coffees WHERE user_id = " + user_id, function (coffeeList) {
            console.log(coffeeList);
            res.status(200).send(coffeeList);
        });
    } else {
        res.status(404).send('User not found with ID: ' + req.params.user_id);
    }
});

app.post('/users/:user_id/coffees', function (req, res) {
    var user_id = parseInt(req.params.user_id);
    if(!isNaN(user_id) && user_id > 0) {
        doInsert("INSERT INTO Coffees(id, user_id, unit_price) VALUES (NULL, ?, ?)", [[user_id, 0.30]]);
        console.log("Inserted 1 Coffee into database for user with ID: " + user_id);
        res.status(201).send('OK');
    } else {
        res.status(404).send('User not found with ID: ' + req.params.user_id);
    }
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

function doInsert(statement, values) {
    db.serialize(function() {
        var stmt = db.prepare(statement);
        for (var i = 0; i < values.length; i++) {
            stmt.run(values[i]);
        }
        stmt.finalize();
    });
}

function doSelect(query, callback) {
    var output = [];

    db.serialize(function() {
        db.each(query,
            function(err, row) {
                output.push(row);
            },
            function (err, rowCount) {
                callback(output);
            }
        );
    });
}
