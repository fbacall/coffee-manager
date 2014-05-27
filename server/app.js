'use strict';

module.exports = function(app, db) {
    var User = require('./models/user')(db);

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

    app.post('/users', function (req, res) {
        User.create(req.body.user, function (err, id) {
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
};
