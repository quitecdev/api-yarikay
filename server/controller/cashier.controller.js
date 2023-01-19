const CashierModel = require('../models/cashier.model');
const _ = require('underscore');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;

let create = (req, res) => {

    let body = req.body;
    try {

        let cashier = new CashierModel({
            branch: body.branch,
            date: body.date,
            opening: {
                cash: body.opening.cash,
                electronic: body.opening.electronic,
                card: body.opening.card,
            }

        });

        cashier.save((err, cashier) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                cashier
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error
        });
    }
}

let updateforId = (req, res) => {
    try {
        let id = req.params.id;

        let body = _.pick(req.body, ['closing', 'production', 'state']);

        CashierModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, category) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                category
            });

        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getCashier = (req, res) => {
    let branch = req.params.branch;

    var start = moment().utc(true).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
    var end = moment().utc(true).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format();

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$date", timezone: "+00:00" } }
            }
        },
        { $match: { branch: new ObjectId(branch), date: { $gte: start, $lt: end }, state: true } },
    ]

    CashierModel.aggregate(query).exec((err, cashier) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            cashier
        });

    });
}


module.exports = {
    create,
    getCashier,
    updateforId
}