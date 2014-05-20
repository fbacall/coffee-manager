'use strict';

module.exports = function(db) {
    function User(id, name, card_id) {
        this.id = id;
        this.name = name;
        this.card_id = card_id;
    }

    User.prototype.addCoffee = function () {
        db.doInsert(User.addCoffeeQuery, [this.id, 0.30]);
    };

    User.prototype.listCoffees = function (callback) {
        db.doSelect(User.listCoffeeQuery, this.id,
            function (err, coffeeList) {
                callback(err, coffeeList);
            }
        );
    };

    User.selectQuery = db.prepare("SELECT * FROM Users WHERE id = ? LIMIT 1");
    User.listCoffeeQuery = db.prepare("SELECT * FROM Coffees WHERE user_id = ? ORDER BY id DESC LIMIT 10");
    User.addCoffeeQuery = db.prepare("INSERT INTO Coffees(id, user_id, unit_price) VALUES (NULL, ?, ?)");

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
