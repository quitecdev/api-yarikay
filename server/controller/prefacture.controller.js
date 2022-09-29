const PrefactureModel = require('../models/prefacture.model');
const PdfController = require('./pdf.controller');
const _ = require('underscore');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;


let createInvoice = (req, res) => {

    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`

    let body = req.body;
    try {

        let prefacture = new PrefactureModel({
            branch: body.branch,
            document: body.document,
            client: body.client,
            details: body.details,
            due: {
                subTotal: body.due.subTotal,
                tax: body.due.tax,
                total: body.due.total,
            },
            user: body.user,
            attachment: filename,
            prepaid: body.prepaid
        });

        //PdfController.pdfInvoice(req, body, filename);


        prefacture.save((err, prefacture) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                prefacture
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

        PrefactureModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, prefacture) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!prefacture) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                prefacture
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

        let body = _.pick(req.body, ['branch', 'documentType', 'document', 'client', 'date', 'details', 'due', 'payment', 'user', 'prepaid', 'fee', 'images', 'state']);

        PrefactureModel.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, prefacture) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                prefacture
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

        PrefactureModel.find({ state: true }).exec((err, prefactures) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                prefactures
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

        PrefactureModel.find({ _id: new ObjectId(id) }).exec((err, prefacture) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                prefacture: prefacture[0]
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getFilterPrefactures = (req, res) => {
    let branch = req.params.branch;

    const dateStart = req.query.star;
    const dateEnd = req.query.end;

    var start = moment().utc(true).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
    var end = moment().utc(true).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format();

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$date", timezone: "+00:00" } }
            }
        },
        { $match: { branch: new ObjectId(branch), date: { $gte: start, $lt: end } } },
        {
            $project: {
                _id: "$_id",
                document: "$document",
                attachment: "$attachment",
                dni: "$client.dni",
                client: "$client.name",
                total: "$due.total",
                prepaid: "$prepaid",
                images: "$images",
                date: "$date",
                state: "$state",
            }
        },
        { $sort: { date: -1 } },
    ];


    PrefactureModel.aggregate(query).exec((err, prefactures) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            prefactures
        });
    });
}

let getPrefactureDetail = (req, res) => {

    let id = req.params.id;

    let query = [
        { $match: { _id: new ObjectId(id) } },
        {
            $addFields: {
                "product_ids": {
                    $reduce: {
                        input: ['$details'],
                        initialValue: [],
                        in: { $concatArrays: ["$$value", "$$this.product"] }
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'stocks',
                let: { "product_id": "$product_ids", "branch_id": "$branch" },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                { $in: ["$product", "$$product_id"] },
                                { $eq: ["$$branch_id", "$branch"] }
                            ]
                        }
                    },
                }, ],
                as: 'stock_product'
            }
        },
        {
            $addFields: {
                "details": {
                    $map: {
                        input: "$details",
                        in: {
                            $mergeObjects: [
                                "$$this",
                                {
                                    "product": {
                                        $arrayElemAt: [
                                            "$stock_product",
                                            { $indexOfArray: ["$product_ids", "$$this.product"] }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }

            }
        },
        { $project: { "product_ids": 0, "stock_product": 0 } }
    ];


    PrefactureModel.aggregate(query).exec((err, prefacture) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            prefacture: prefacture[0]
        });
    });
}

let getReportFilter = (req, res) => {

    var dateStart = req.query.star;
    var dateEnd = req.query.end;
    var branch = req.query.branch;
    var documentType = req.query.documentType;
    var state = req.query.state;
    var prepaid = req.query.prepaid;
    var user = req.query.user;

    var start = moment(dateStart).utc(true).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
    var end = moment(dateEnd).utc(true).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format();

    var filter = {};

    if (branch) {
        filter["branch._id"] = { "$eq": new ObjectId(branch) }
    }
    if (documentType) {
        filter["documentType._id"] = { "$eq": new ObjectId(documentType) }
    }
    if (state === "true") {
        filter["state"] = { "$eq": true }
    }
    if (state === "false") {
        filter["state"] = { "$eq": false }
    }
    if (prepaid === "true") {
        filter["prepaid"] = { "$eq": true }
    }
    if (prepaid === "false") {
        filter["prepaid"] = { "$eq": false }
    }
    if (user) {
        filter["user._id"] = { "$eq": new ObjectId(user) }
    }

    filter["date"] = { $gte: start, $lt: end };

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$date", timezone: "+00:00" } }
            }
        },
        {
            $lookup: {
                from: 'documenttypes',
                localField: 'documentType',
                foreignField: '_id',
                as: 'documentType'
            }
        },
        {
            $lookup: {
                from: 'branches',
                localField: 'branch',
                foreignField: '_id',
                as: 'branch'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$documentType' },
        { $unwind: '$branch' },
        { $unwind: '$user' },
        {
            $match: filter
        },

        {
            $project: {
                _id: "$_id",
                branch: "$branch.name",
                documentType: "$documentType.name",
                document: "$document",
                attachment: "$attachment",
                dni: "$client.dni",
                client: "$client.name",
                total: "$due.total",
                prepaid: "$prepaid",
                images: "$images",
                date: "$date",
                state: "$state",
                user: "$user.name"
            }
        },
        { $sort: { date: -1 } },
    ];

    PrefactureModel.aggregate(query).exec((err, prefactures) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            prefactures
        });
    });
}

module.exports = {
    getAll,
    getForId,
    updateforId,
    deleteforId,
    getPrefactureDetail,
    createInvoice,
    getFilterPrefactures,
    getReportFilter,
}