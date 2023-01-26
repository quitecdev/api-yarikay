const SaleModel = require('../models/sale.model');
const PdfController = require('./pdf.controller');
const _ = require('underscore');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;


let createInvoice = (req, res) => {

    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`

    let body = req.body;

    try {

        let sale = new SaleModel({
            branch: body.branch,
            documentType: body.documentType,
            accessCode: body.accessCode,
            document: body.document,
            client: body.client,
            details: body.details,
            due: {
                subTotal: body.due.subTotal,
                tax: body.due.tax,
                total: body.due.total,
            },
            payment: {
                cash: body.payment.cash,
                electronic: body.payment.electronic,
                card: body.payment.card,
                bank: body.payment.bank,
                brand: body.payment.brand,
                baucher: body.payment.baucher,
                account: body.payment.account,
            },
            fee: body.fee,
            user: body.user,
            attachment: filename,
            prepaid: body.prepaid,
            observations: body.observations
        });

        PdfController.pdfInvoice(req, body, filename);


        sale.save((err, sale) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                sale
            });
        });


    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let createNote = (req, res) => {

    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`

    let body = req.body;
    try {

        let sale = new SaleModel({
            branch: body.branch,
            documentType: body.documentType,
            document: body.document,
            client: body.client,
            details: body.details,
            due: {
                subTotal: body.due.subTotal,
                tax: body.due.tax,
                total: body.due.total,
            },
            payment: {
                cash: body.payment.cash,
                electronic: body.payment.electronic,
                card: body.payment.card,
                bank: body.payment.bank,
                baucher: body.payment.baucher,
                account: body.payment.account,
            },
            user: body.user,
            attachment: filename,
            prepaid: body.prepaid
        });

        PdfController.pdfNote(req, body, filename);


        sale.save((err, sale) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                sale
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

        SaleModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, sale) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!sale) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                sale
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

        SaleModel.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, sale) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                sale
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

        SaleModel.find({ state: true }).exec((err, sales) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                sales
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

        let query = [{
                $addFields: {
                    date: { $dateToString: { date: "$date", timezone: "+00:00" } }
                }
            },
            { $match: { _id: new ObjectId(id) } },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branch',
                    foreignField: '_id',
                    as: 'branch'
                }
            },
            { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
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
                    from: 'clients',
                    localField: 'dni',
                    foreignField: '_id',
                    as: 'client'
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
            {
                $lookup: {
                    from: 'products',
                    localField: 'details.product',
                    foreignField: '_id',
                    as: 'product'
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
                                                "$product",
                                                { $indexOfArray: ["$product._id", "$$this.product"] }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'stocks',
                    localField: 'details.product._id',
                    foreignField: 'product',
                    as: 'stock'
                }
            },


            // {
            //     $addFields: {
            //         'details.product.existence': {
            //             $map: {
            //                 input: "$details.product",
            //                 as: "i",
            //                 in: {
            //                     $mergeObjects: [
            //                         "$$i",
            //                         {
            //                             $first: {
            //                                 $filter: {
            //                                     input: "$stock",
            //                                     cond: { $eq: ["$$this.product", "$$i._id"] }
            //                                 }
            //                             }
            //                         }
            //                     ]
            //                 }
            //             }
            //         },
            //     },
            // },
            {
                $project: {
                    _id: '$_id',
                    payment: '$payment',
                    fee: '$fee',
                    date: '$date',
                    accessCode: "$accessCode",
                    prepaid: '$prepaid',
                    state: '$state',
                    document: '$document',
                    document: '$document',
                    details: '$details',
                    due: '$due',
                    attachment: '$attachment',
                    client: { "$arrayElemAt": ["$client", 0] },
                    branch: "$branch",
                    user: { "$arrayElemAt": ["$user", 0] },
                    documentType: { "$arrayElemAt": ["$documentType", 0] },
                    stock: "$stock"
                }
            },
        ];

        SaleModel.aggregate(query).exec((err, sale) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                sale: sale[0]
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getFilterSales = (req, res) => {
    let branch = req.params.branch;


    const dateStart = moment.tz(req.query.star, "America/Guayaquil");
    const dateEnd = moment.tz(req.query.end, "America/Guayaquil");


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
                document: "$document",
                accessCode: "$accessCode",
                attachment: "$attachment",
                dni: "$client.dni",
                client: "$client.name",
                cash: "$payment.cash",
                electronic: "$payment.electronic",
                card: "$payment.card",
                total: "$due.total",
                prepaid: "$prepaid",
                images: "$images",
                date: "$date",
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


let getSaleDetail = (req, res) => {

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


    SaleModel.aggregate(query).exec((err, sale) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            sale: sale[0]
        });
    });
}

let getReportFilter = (req, res) => {

    var dateStart = moment.tz(req.query.star, "America/Guayaquil");
    var dateEnd = moment.tz(req.query.end, "America/Guayaquil");
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
                date: { $dateToString: { date: "$date", timezone: "America/Guayaquil" } }
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
                images: "$images",
                date: "$date",
                state: "$state",
                user: "$user.name"
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


cancelSale = (req, res) => {

    let id = req.params.id;
    let body = req.body;

    res.json({
        ok: true
    });
}

module.exports = {
    getAll,
    getForId,
    createNote,
    updateforId,
    deleteforId,
    getSaleDetail,
    createInvoice,
    getFilterSales,
    getReportFilter,
}