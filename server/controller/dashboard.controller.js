const ProductModel = require('../models/product.model');
const KardexModel = require('../models/kardex.model');
const SaleModel = require('../models/sale.model');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;

let getCountProduct = (req, res) => {

    ProductModel.find().countDocuments().exec((err, products) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            products
        });
    });
}

let getCountKardex = (req, res) => {

    let branch = req.params.branch;

    KardexModel.find({ branch: new ObjectId(branch) }).countDocuments().exec((err, kardex) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            kardex
        });
    });
}

let getCountSales = (req, res) => {

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
        { $match: { branch: new ObjectId(branch), state: true, date: { $gte: start, $lt: end } } },
        { $group: { _id: null, count: { $sum: 1 } } },
    ]

    SaleModel.aggregate(query).exec((err, sales) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (sales.length > 0) {
            res.json({
                sales: sales[0].count
            });
        } else {
            res.json({
                sales: 0
            });
        }

    });
}

let getSaleTotal = (req, res) => {

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
        { $match: { branch: new ObjectId(branch), date: { $gte: start, $lt: end }, state: true } },
        {
            $group: {
                _id: null,
                cash: { $sum: "$payment.cash" },
                electronic: { $sum: "$payment.electronic" },
                card: { $sum: "$payment.card" },
            }
        }
    ];


    SaleModel.aggregate(query).exec((err, sales) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (sales.length <= 0) {
            return res.json({
                cash: 0,
                electronic: 0,
                card: 0,
            });
        }

        res.json({
            cash: sales[0].cash,
            electronic: sales[0].electronic,
            card: sales[0].card,
        });
    });
}

let getDetailSales = (req, res) => {
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
        { $match: { branch: new ObjectId(branch), date: { $gte: start, $lt: end } } },
        {
            $lookup: {
                from: 'documenttypes',
                localField: 'documentType',
                foreignField: '_id',
                as: 'documentType'
            }
        },
        { $unwind: '$documentType' },
        {
            $project: {
                _id: "$_id",
                documentType: "$documentType.name",
                accessCode: "$accessCode",
                document: "$document",
                attachment: "$attachment",
                dni: "$client.dni",
                client: "$client.name",
                cash: "$payment.cash",
                electronic: "$payment.electronic",
                card: "$payment.card",
                total: "$due.total",
                prepaid: "$prepaid",
                date: "$date",
                fee: "$fee",
                state: "$state",
            }
        },
        { $sort: { date: -1 } },
    ];


    SaleModel.aggregate(query).exec((err, sales) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            sales
        });
    });
}

module.exports = {
    getCountProduct,
    getCountKardex,
    getCountSales,
    getSaleTotal,
    getDetailSales
}