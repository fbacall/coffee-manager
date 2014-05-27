'use strict';

module.exports = function(db) {
    var Payment = require('./payment')(db);
    var Coffee = require('./coffee')(db);

    function User(card_id, name) {
        this.card_id = card_id;
        this.name = name;
    }

    User.selectQuery = db.prepare("SELECT * FROM Users WHERE card_id = ? LIMIT 1");
    User.createQuery = db.prepare("INSERT INTO Users(card_id, name) VALUES (?, ?)");


    User.prototype.addCoffee = function (callback) {
        Coffee.create(this.card_id, 0.25, callback);
    };

    User.prototype.recentCoffees = function (callback) {
        Coffee.recent(this.card_id, 10, function (err, coffeeList) {
            callback(err, coffeeList);
        });
    };

    User.prototype.addPayment = function (amount, callback) {
        Payment.create(this.card_id, amount, callback);
    };

    User.prototype.recentPayments = function (callback) {
        Payment.recent(this.card_id, 10, function (err, coffeeList) {
            callback(err, coffeeList);
        });
    };

    User.prototype.balance = function (callback) {
        var u = this;
        Coffee.cost(u.card_id, function (err, cost) {
            Payment.total(u.card_id, function (err, payment) {
                callback(err, (payment - cost));
            });
        });
    };

    User.find = function (card_id, callback) {
        db.doSelect(User.selectQuery, card_id, function (err, users) {
            var user;
            if(err) {
                console.log(err.stack);
            } else if (users[0]) {
                user = new User(users[0].card_id, users[0].name);
            }
            callback(err, user);
        });
    };

    User.create = function(user, callback) {
        db.doInsert(User.createQuery, [user.card_id, user.name], callback);
    };

    return User;
};
