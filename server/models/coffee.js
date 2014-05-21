'use strict';

module.exports = function(db) {
    var Coffee = {};

    Coffee.recentQuery = db.prepare("SELECT * FROM Coffees ORDER BY id DESC LIMIT ?");
    Coffee.userRecentQuery = db.prepare("SELECT * FROM Coffees WHERE user_id = ? ORDER BY id DESC LIMIT ?");
    Coffee.addQuery = db.prepare("INSERT INTO Payments(id, user_id, amount) VALUES (NULL, ?, ?)");
    Coffee.costQuery = db.prepare("SELECT SUM(unit_price) FROM Coffees");
    Coffee.userCostQuery = db.prepare("SELECT SUM(unit_price) FROM Coffees WHERE user_id = ?");

    Coffee.create = function (user_id, unit_price) {
        db.doInsert(Coffee.addQuery, [user_id, unit_price]);
    };

    Coffee.cost = function (user_id, callback) {
        var f = function (err, costs) {
            var cost = parseFloat(costs[0]['SUM(unit_price)']);
            callback(err, cost);
        };

        if(user_id) {
            db.doSelect(Coffee.userCostQuery, user_id, f);
        } else {
            db.doSelect(Coffee.costQuery, null, f);
        }
    };
    
    Coffee.recent = function (user_id, limit, callback) {
        if(user_id) {
            db.doSelect(Coffee.userRecentQuery, [user_id, limit], callback);
        } else {
            db.doSelect(Coffee.recentQuery, limit, callback);
        }
    };

    return Coffee;
};