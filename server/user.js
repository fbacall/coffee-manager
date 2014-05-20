'use strict';

module.exports = function(db) {
    function User(id, name, card_id) {
        this.id = id;
        this.name = name;
        this.card_id = card_id;
    }

    User.prototype.addCoffee = function () {
        db.doInsert(User.addCoffeeQuery, [this.id, 0.25]);
    };

    User.prototype.recentCoffees = function (callback) {
        db.doSelect(User.recentCoffeeQuery, this.id,
            function (err, coffeeList) {
                callback(err, coffeeList);
            }
        );
    };

    User.prototype.addPayment = function (amount) {
        db.doInsert(User.addPaymentQuery, [this.id, amount]);
    };

    User.prototype.recentPayments = function (callback) {
        db.doSelect(User.recentPaymentQuery, this.id,
            function (err, coffeeList) {
                callback(err, coffeeList);
            }
        );
    };

    User.prototype.balance = function (callback) {
        var u = this;
        db.doSelect(User.totalCoffeeCostQuery, u.id,
            function (err, costs) {
                var cost = parseFloat(costs[0]['SUM(unit_price)']);
                db.doSelect(User.totalPaymentQuery, u.id,
                    function (err, payments) {
                        var payment = parseFloat(payments[0]['SUM(amount)']);
                        callback(err, (payment - cost));
                    }
                );
            }
        );
    };

    User.selectQuery = db.prepare("SELECT * FROM Users WHERE id = ? LIMIT 1");

    User.recentCoffeeQuery = db.prepare("SELECT * FROM Coffees WHERE user_id = ? ORDER BY id DESC LIMIT 10");
    User.addCoffeeQuery = db.prepare("INSERT INTO Coffees(id, user_id, unit_price) VALUES (NULL, ?, ?)");
    User.totalCoffeeCostQuery = db.prepare("SELECT SUM(unit_price) FROM Coffees WHERE user_id = ?");

    User.recentPaymentQuery = db.prepare("SELECT * FROM Payments WHERE user_id = ? ORDER BY id DESC LIMIT 10");
    User.addPaymentQuery = db.prepare("INSERT INTO Payments(id, user_id, amount) VALUES (NULL, ?, ?)");
    User.totalPaymentQuery = db.prepare("SELECT SUM(amount) FROM Payments WHERE user_id = ?");

    User.find = function (id, callback) {
        db.doSelect(User.selectQuery, parseInt(id),
            function (err, users) {
                var user;
                if(err) {
                    console.log(err.stack);
                } else if (users[0]) {
                    user = new User(users[0].id, users[0].name, users[0].card_id);
                }
                callback(err, user);
            }
        );
    };

    return User;
};
