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
        req.user.recentCoffees(function (err, coffeeList) {
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
        req.user.recentCoffees(function (err, coffeeList) {
            if(err) {
                console.log("ERROR: " + err.stack);
                res.status(500).send('');
            } else {
                res.status(201).send(coffeeList[0]);
            }
        });
    });

    app.get('/users/:user_id/payments', function (req, res) {
        req.user.recentPayments(function (err, coffeeList) {
            if(err) {
                console.log("ERROR: " + err.stack);
                res.status(500).send('');
            } else {
                res.status(200).send(coffeeList);
            }
        });
    });

    app.post('/users/:user_id/payments', function (req, res) {
        var payment = parseFloat(req.body.amount);
        console.log("Payment for user " + req.user.name + ' : ' + req.body.amount);
        if(!isNaN(payment) && payment > 0) {
            req.user.addPayment();
            req.user.recentPayments(function (err, coffeeList) {
                if(err) {
                    console.log("ERROR: " + err.stack);
                    res.status(500).send('');
                } else {
                    res.status(201).send(coffeeList[0]);
                }
            });
        } else {
            res.status(400).send('Invalid payment amount');
        }
    });

    app.get('/users/:user_id/balance', function (req, res) {
        req.user.balance(function (err, balance) {
            console.log(balance);
            if(err) {
                console.log("ERROR: " + err.stack);
                res.status(500).send('');
            } else {
                res.status(200).send(balance.toFixed(2));
            }
        });
    });
};
