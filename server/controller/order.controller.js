const OrderModel = require('../models/order.model');
const PdfController = require('./pdf.controller');
const _ = require('underscore');
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');

let create = (req, res) => {

    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`

    let body = req.body;
    try {

        let order = new OrderModel({
            name: body.name,
            table: body.table,
            details: body.details,
            branch: body.branch,
            due: {
                subTotal: body.due.subTotal,
                tax: body.due.tax,
                total: body.due.total,
            },
            attachment: filename,
            user: body.user,
        });

        order.save((err, order) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            PdfController.pdfOrder(req, order._id, filename);

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

        let body = _.pick(req.body, ['name', 'table', 'state']);

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

        OrderModel.find({ _id: id }).populate("table").exec((err, order) => {
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
                date: { $dateToString: { date: "$date", timezone: "America/Guayaquil" } }
            }
        },

        { $match: { branch: ObjectId(branch), date: { $gte: start, $lt: end } } },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $lookup: {
                from: 'tables',
                localField: 'table',
                foreignField: '_id',
                as: 'table'
            }
        },
        {
            $project: {
                _id: "$_id",
                number: "$number",
                name: "$name",
                user: { "$arrayElemAt": ["$user", 0] },
                table: { "$arrayElemAt": ["$table", 0] },
                details: "$details",
                due: "$due",
                attachment: "$attachment",
                date: "$date",
                state: "$state"
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

    const dateStart = moment.tz(Date.now(), "America/Guayaquil");
    const dateEnd = moment.tz(Date.now(), "America/Guayaquil");

    var start = moment(dateStart).utc(true).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
    var end = moment(dateEnd).utc(true).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format();

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$date", timezone: "America/Guayaquil" } }
            }
        },
        { $match: { branch: ObjectId(branch), state: 0, date: { $gte: start, $lt: end } } },
        { $unwind: '$details' },

        { $match: { 'details.state': 0, 'details.composed': true }, },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $lookup: {
                from: 'tables',
                localField: 'table',
                foreignField: '_id',
                as: 'table'
            }
        },
        {
            $project: {
                _id: "$details._id",
                number: "$number",
                user: { "$arrayElemAt": ["$user", 0] },
                table: { "$arrayElemAt": ["$table", 0] },
                cod: "$details.cod",
                name: "$details.name",
                quantity: "$details.quantity",
                observation: "$details.observation",
                timer: "$date",
                composed: "$details.composed",
                state: "$details.state",
            }
        },
        { $sort: { timer: 1, state: 1, } }
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

let getOrderDrink = (req, res) => {
    let branch = req.params.branch;

    const dateStart = moment.tz(Date.now(), "America/Guayaquil");
    const dateEnd = moment.tz(Date.now(), "America/Guayaquil");

    var start = moment(dateStart).utc(true).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
    var end = moment(dateEnd).utc(true).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format();

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$date", timezone: "America/Guayaquil" } }
            }
        },
        { $match: { branch: ObjectId(branch), state: 0, date: { $gte: start, $lt: end } } },
        { $unwind: '$details' },
        { $match: { 'details.state': 0, 'details.composed': false }, },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $lookup: {
                from: 'tables',
                localField: 'table',
                foreignField: '_id',
                as: 'table'
            }
        },
        {
            $project: {
                _id: "$details._id",
                number: "$number",
                table: "$table",
                user: { "$arrayElemAt": ["$user", 0] },
                table: { "$arrayElemAt": ["$table", 0] },
                cod: "$details.cod",
                name: "$details.name",
                quantity: "$details.quantity",
                observation: "$details.observation",
                timer: "$date",
                composed: "$details.composed",
                state: "$details.state",
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

let addDetailOrder = (req, res) => {

    let body = req.body;

    let id = req.params.id;

    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`

    OrderModel
        .findOneAndUpdate({ "_id": id }, { attachment: filename, due: body.due, $push: { "details": body.details } }, { safe: true, upsert: true, new: true },
            (err, order) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                PdfController.pdfOrder(req, id, filename);

                res.json({
                    order
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
    getOrderKitchen,
    getOrderDrink,
    addDetailOrder
}