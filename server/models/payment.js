'use strict';

module.exports = function(db) {
    var Payment = {};

    Payment.recentQuery = db.prepare("SELECT * FROM Payments ORDER BY id DESC LIMIT ?");
    Payment.userRecentQuery = db.prepare("SELECT * FROM Payments WHERE user_id = ? ORDER BY id DESC LIMIT ?");
    Payment.addQuery = db.prepare("INSERT INTO Payments(id, user_id, amount) VALUES (NULL, ?, ?)");
    Payment.totalQuery = db.prepare("SELECT SUM(amount) FROM Payments");
    Payment.userTotalQuery = db.prepare("SELECT SUM(amount) FROM Payments WHERE user_id = ?");

    Payment.create = function (user_id, amount, callback) {
        db.doInsert(Payment.addQuery, [user_id, amount], callback);
    };

    Payment.total = function (user_id, callback) {
        var f = function (err, payments) {
            var payment = parseFloat(payments[0]['SUM(amount)']);
            if(isNaN(payment))
                payment = 0;
            callback(err, payment);
        };

        if(user_id) {
            db.doSelect(Payment.userTotalQuery, user_id, f);
        } else {
            db.doSelect(Payment.totalQuery, null, f);
        }
    };

    Payment.recent = function (user_id, limit, callback) {
        if(user_id) {
            db.doSelect(Payment.userRecentQuery, [user_id, limit], callback);
        } else {
            db.doSelect(Payment.recentQuery, limit, callback);
        }
    };

    return Payment;
};