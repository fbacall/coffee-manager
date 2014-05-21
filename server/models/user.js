'use strict';

module.exports = function(db) {
    var Payment = require('./payment')(db);
    var Coffee = require('./coffee')(db);

    function User(id, name, card_id) {
        this.id = id;
        this.name = name;
        this.card_id = card_id;
    }

    User.selectQuery = db.prepare("SELECT * FROM Users WHERE id = ? LIMIT 1");

    User.prototype.addCoffee = function () {
        Coffee.create(this.id, 0.25);
    };

    User.prototype.recentCoffees = function (callback) {
        Coffee.recent(this.id, 10, function (err, coffeeList) {
            callback(err, coffeeList);
        });
    };

    User.prototype.addPayment = function (amount) {
        Payment.create(this.id, amount);
    };

    User.prototype.recentPayments = function (callback) {
        Payment.recent(this.id, 10, function (err, coffeeList) {
            callback(err, coffeeList);
        });
    };

    User.prototype.balance = function (callback) {
        var u = this;
        Coffee.cost(u.id, function (err, cost) {
            Payment.total(u.id, function (err, payment) {
                callback(err, (payment - cost));
            });
        });
    };

    User.find = function (id, callback) {
        db.doSelect(User.selectQuery, parseInt(id), function (err, users) {
            var user;
            if(err) {
                console.log(err.stack);
            } else if (users[0]) {
                user = new User(users[0].id, users[0].name, users[0].card_id);
            }
            callback(err, user);
        });
    };

    return User;
};
