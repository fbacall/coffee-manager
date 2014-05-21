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
    User.createQuery = db.prepare("INSERT INTO Users(id, card_id, name) VALUES (NULL, ?, ?)");


    User.prototype.addCoffee = function (callback) {
        Coffee.create(this.id, 0.25, callback);
    };

    User.prototype.recentCoffees = function (callback) {
        Coffee.recent(this.id, 10, function (err, coffeeList) {
            callback(err, coffeeList);
        });
    };

    User.prototype.addPayment = function (amount, callback) {
        Payment.create(this.id, amount, callback);
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

    User.create = function(user, callback) {
        db.doInsert(User.createQuery, [user.card_id, user.name], callback);
    };

    return User;
};
