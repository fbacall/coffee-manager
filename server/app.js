'use strict';

module.exports = function(app, db) {
    var User = require('./user')(db);

    app.param('user_id', function(req, res, next, id){
        User.find(id, function(err, user){
            if (err) {
                console.log("Error while fetching user: " + err.stack);
                res.status(500).send('');
            } else if (user) {
                req.user = user;
                next();
            } else {
                res.status(404).send('User not found with ID: ' + id);
            }
        });
    });

    app.get('/users/:user_id/coffees', function (req, res) {
        req.user.listCoffees(function (err, coffeeList) {
            if(err) {
                console.log("ERROR: " + err.stack);
                req.status(500).send('');
            } else {
                res.status(200).send(coffeeList);
            }
        });
    });

    app.post('/users/:user_id/coffees', function (req, res) {
        req.user.addCoffee();
        req.user.listCoffees(function (err, coffeeList) {
            if(err) {
                console.log("ERROR: " + err.stack);
                req.status(500).send('');
            } else {
                res.status(201).send(coffeeList[0]);
            }
        });
    });
};
