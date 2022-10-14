const OrderModel = require('../models/order.model');
const _ = require('underscore');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;

let create = (req, res) => {

    let body = req.body;
    try {

        let order = new OrderModel({
            table: body.table,
            details: body.details,
            branch: body.branch,
            user: body.user,
        });

        order.save((err, order) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                order
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let deleteforId = (req, res) => {
    try {
        let id = req.params.id;

        OrderModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, order) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!order) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                order
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let updateforId = (req, res) => {
    try {
        let id = req.params.id;

        let body = _.pick(req.body, ['name', 'state']);

        OrderModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, order) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                order
            });

        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getAll = (req, res) => {
    try {

        OrderModel.find({ state: true }).exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                orders
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getForId = (req, res) => {
    try {
        let id = req.params.id;

        OrderModel.find({ _id: id }).exec((err, order) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                order: order[0]
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}


let getForDay = (req, res) => {

    let branch = req.params.branch;

    const dateStart = moment.tz(Date.now(), "America/Guayaquil");
    const dateEnd = moment.tz(Date.now(), "America/Guayaquil");

    var start = moment(dateStart).utc(true).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
    var end = moment(dateEnd).utc(true).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format();

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$date", timezone: "+00:00" } }
            }
        },
        { $match: { branch: new ObjectId(branch) } },
        { $sort: { state: 1 } }
    ];

    OrderModel.aggregate(query).exec((err, orders) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            orders
        });
    });
}

let updateStateOrder = (req, res) => {

    OrderModel.update({ 'details._id': req.params.id }, { $set: { 'details.$.state': req.params.state } },
        (err, result) => {
            if (err) {
                res.status(500)
                    .json({ error: 'Unable to update competitor.', });
            } else {
                res.status(200)
                    .json(result);
            }
        }
    );

}

let getOrderKitchen = (req, res) => {
    let branch = req.params.branch;

    console.log('Cargar en orden');
    const dateStart = moment.tz(Date.now(), "America/Guayaquil");
    const dateEnd = moment.tz(Date.now(), "America/Guayaquil");

    var start = moment(dateStart).utc(true).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
    var end = moment(dateEnd).utc(true).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format();

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$date", timezone: "+00:00" } }
            }
        },
        { $match: { branch: new ObjectId(branch), state: 0 } },
        { $unwind: '$details' },
        { $match: { 'details.state': 0, 'details.composed': true }, },
        {
            $project: {
                _id: "$details._id",
                number: "$number",
                table: "$table",
                cod: "$details.cod",
                name: "$details.name",
                quantity: "$details.quantity",
                observation: "$details.observation",
                composed: "$details.composed",
            }
        },
        { $sort: { state: 1 } }
    ];

    OrderModel.aggregate(query).exec((err, orders) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            orders
        });
    });

}

module.exports = {
    create,
    updateforId,
    deleteforId,
    getAll,
    getForId,
    getForDay,
    updateStateOrder,
    getOrderKitchen
}