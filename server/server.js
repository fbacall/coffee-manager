'use strict';

var app = require('express')();
var db = require('./database')();

require('./app')(app, db);

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
