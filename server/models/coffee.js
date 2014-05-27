'use strict';

module.exports = function(db) {
    var Coffee = {};

    Coffee.price = 0.25;

    Coffee.addQuery = db.prepare("INSERT INTO Coffees(id, user_card_id, unit_price) VALUES (NULL, ?, ?)");

    Coffee.recentQuery = db.prepare("SELECT * FROM Coffees ORDER BY id DESC LIMIT ?");
    Coffee.userRecentQuery = db.prepare("SELECT * FROM Coffees WHERE user_card_id = ? ORDER BY id DESC LIMIT ?");

    Coffee.totalQuery = db.prepare("SELECT COUNT(*) FROM Coffees");
    Coffee.userTotalQuery = db.prepare("SELECT COUNT(*) FROM Coffees WHERE user_card_id = ?");

    Coffee.costQuery = db.prepare("SELECT SUM(unit_price) FROM Coffees");
    Coffee.userCostQuery = db.prepare("SELECT SUM(unit_price) FROM Coffees WHERE user_card_id = ?");

    Coffee.create = function (user_card_id, unit_price, callback) {
        db.doInsert(Coffee.addQuery, [user_card_id, unit_price], callback);
    };

    Coffee.cost = function (user_card_id, callback) {
        var f = function (err, costs) {
            var cost = parseFloat(costs[0]['SUM(unit_price)']);
            if(isNaN(cost))
                cost = 0;
            callback(err, cost);
        };

        if(user_card_id) {
            db.doSelect(Coffee.userCostQuery, user_card_id, f);
        } else {
            db.doSelect(Coffee.costQuery, null, f);
        }
    };
    
    Coffee.recent = function (user_card_id, limit, callback) {
        if(user_card_id) {
            db.doSelect(Coffee.userRecentQuery, [user_card_id, limit], callback);
        } else {
            db.doSelect(Coffee.recentQuery, limit, callback);
        }
    };

    Coffee.total = function (user_card_id, callback) {
        if(user_card_id) {
            db.doSelect(Coffee.userTotalQuery, user_card_id, callback);
        } else {
            db.doSelect(Coffee.totalQuery, null, callback);
        }
    };

    return Coffee;
};