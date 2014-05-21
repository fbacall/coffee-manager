'use strict';

module.exports = function() {
// Config
    var file = "test.db";
    var TABLES = [
        "CREATE TABLE Coffees (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, date DATETIME DEFAULT CURRENT_TIMESTAMP, unit_price DECIMAL(5,2))",
        "CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, card_id VARCHAR(255), name VARCHAR(255))",
        "CREATE TABLE Payments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, date DATETIME DEFAULT CURRENT_TIMESTAMP, amount DECIMAL(5,2))"
    ];

// Database Setup

// Create db file if it doesn't exist
    var fs = require("fs");
    var exists = fs.existsSync(file);

    if (!exists) {
        console.log("Creating DB file...");
        fs.openSync(file, "w");
    }

    var sqlite3 = require("sqlite3").verbose();
    var db = new sqlite3.Database(file);

// Create tables if new DB
    if (!exists) {
        console.log("Creating tables...");
        db.serialize(function () {
            for (var i = 0; i < TABLES.length; i++) {
                console.log("Running: " + TABLES[i]);
                db.run(TABLES[i]);
            }
        });
    }

// Convenience functions
    db.doInsert = function (statement, values, callback) {
        db.serialize(function () {
            statement.run(values, function (err) {
                if(callback)
                    callback(err, this.lastID);
            });
        });
    };

    db.doSelect = function (statement, values, callback) {
        var output = [];

        db.serialize(function () {
            statement.each(values,
                function (err, row) {
                    output.push(row);
                },
                function (err, rowCount) {
                    callback(err, output);
                }
            );
        });
    };

    return db;
};
