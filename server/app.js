'use strict';

module.exports = function(app, db) {
    var User = require('./models/user')(db);
    var Coffee = require('./models/coffee')(db);

    // Look up a user based on card ID
    app.param('user_card_id', function(req, res, next, id){
        User.find(id, function(err, user){
            if (err) {
                console.log("Error while fetching user: " + err.stack);
                res.status(500).send('error');
            } else if (user) {
                req.user = user;
                next();
            } else {
                res.status(404).send('User not found with card ID: ' + id);
            }
        });
    });

    // Lookup user list with their coffee totals
    app.get('/users', function (req, res) {
        User.list(function (err, list) {
            if (err) {
                console.log("ERROR: " + err.stack);
                res.status(500).send('error');
            } else {
                res.status(200).send(list);
            }
        });
    });

    // Create a new user
    app.post('/users', function (req, res) {
        User.create(req.body.card_id, req.body.name, function (err, id) {
            if (err) {
                console.log("Error while creating user: " + err.stack);
                res.status(500).send('error');
            } else {
                User.find(id, function (err, user) {
                    res.status(201).send(user);
                });
            }
        });
    });

    // List user's recent coffees
    app.get('/users/:user_card_id/coffees', function (req, res) {
        req.user.recentCoffees(function (err, coffeeList) {
            if(err) {
                console.log("ERROR: " + err.stack);
                req.status(500).send('error');
            } else {
                res.status(200).send(coffeeList);
            }
        });
    });

    // Add a coffee for a user
    app.post('/users/:user_card_id/coffees', function (req, res) {
        req.user.addCoffee(function (err) {
            if(err) {
                console.log("ERROR: " + err.stack);
                res.status(500).send('error');
            } else {
                req.user.recentCoffees(function (err, coffeeList) {
                    if(err) {
                        console.log("ERROR: " + err.stack);
                        res.status(500).send('error');
                    } else {
                        res.status(201).send(coffeeList[0]);
                    }
                });
            }
        });
    });

    // List user's payments
    app.get('/users/:user_card_id/payments', function (req, res) {
        req.user.recentPayments(function (err, coffeeList) {
            if(err) {
                console.log("ERROR: " + err.stack);
                res.status(500).send('error');
            } else {
                res.status(200).send(coffeeList);
            }
        });
    });

    // Add a payment for a user
    app.post('/users/:user_card_id/payments', function (req, res) {
        var payment = parseFloat(req.body.amount);
        console.log("Payment for user " + req.user.name + ' : ' + req.body.amount);
        if(!isNaN(payment) && payment > 0) {
            req.user.addPayment(payment, function (err) {
                if(err) {
                    console.log("ERROR: " + err.stack);
                    res.status(500).send('error');
                } else {
                    req.user.recentPayments(function (err, paymentList) {
                        if(err) {
                            console.log("ERROR: " + err.stack);
                            res.status(500).send('error');
                        } else {
                            res.status(201).send(paymentList[0]);
                        }
                    });
                }
            });
        } else {
            res.status(400).send('Invalid payment amount');
        }
    });

    // Check a users balance
    app.get('/users/:user_card_id/balance', function (req, res) {
        req.user.balance(function (err, balance) {
            if(err) {
                console.log("ERROR: " + err.stack);
                res.status(500).send('error');
            } else {
                res.status(200).send(balance.toFixed(2));
            }
        });
    });

    // Get current coffee price
    app.get('/price', function (req, res) {
        res.status(200).send(Coffee.price.toFixed(2));
    });
};
