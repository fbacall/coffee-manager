'use strict';
module.exports = function() {
// Config
    var file = "coffee.db";
    var TABLES = [
        "CREATE TABLE Coffees (id INTEGER PRIMARY KEY AUTOINCREMENT, user_card_id VARCHAR(255), date DATETIME DEFAULT CURRENT_TIMESTAMP, unit_price DECIMAL(5,2))",
        "CREATE TABLE Users (card_id VARCHAR(255) PRIMARY KEY, name VARCHAR(255))",
        "CREATE TABLE Payments (id INTEGER PRIMARY KEY AUTOINCREMENT, user_card_id VARCHAR(255), date DATETIME DEFAULT CURRENT_TIMESTAMP, amount DECIMAL(5,2))"
    ];

// Database Setup

// Create db file if it doesn't exist
    var fs = require("fs");
    var exists = fs.existsSync(file);

    if (!exists) {
        console.log("Creating DB file...");
        fs.openSync(file, "w");
    }

    var Database = require('better-sqlite3');
    var db = new Database(file, { verbose: console.log });

// Create tables if new DB
    if (!exists) {
        console.log("Creating tables...");
        var migration = fs.readFileSync('tables.sql', 'utf8');
        db.exec(migration);
    }

// Convenience functions
    db.doInsert = function (statement, values, callback) {
        var info = statement.run(values);
        if(callback)
            callback(info.lastInsertRowid);
    };

    db.doSelect = function (statement, values, callback) {
        var output = statement.all(values);
        callback(output);
    };

    return db;
};
