'use strict';
var express = require('express');
var app = express();

app.use(express.json()); // To parse json in POST requests
app.use(express.static(__dirname + '/public')); // For serving the client pages

var db = require('./database')();

require('./app')(app, db);

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
