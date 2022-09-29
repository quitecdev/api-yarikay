const TransferModel = require('../models/transfer.model');
const PdfController = require('./pdf.controller');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;
const _ = require('underscore');


let create = (req, res) => {

    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`

    let body = req.body;
    try {

        let transfer = new TransferModel({
            branch: body.branch,
            destination: body.destination,
            documentType: body.documentType,
            document: body.document,
            details: body.details,
            user: body.user,
            attachment: filename,
        });

        PdfController.pdfTransfer(req, body, filename);

        transfer.save((err, transfer) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                transfer
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

    let id = req.params.id;

    TransferModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, transfer) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!transfer) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El id no existe' }
            });
        }

        res.json({
            ok: true,
            transfer
        });
    });
}

let updateforId = (req, res) => {

    let id = req.params.id;

    let body = _.pick(req.body, ['branch', 'destination', 'documentType', 'document', 'action']);

    TransferModel.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, transfer) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            transfer
        });

    });
}


let AceptTransfer = (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['action', 'details']);

    TransferModel.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, transfer) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            transfer
        });

    });

}

let getAll = (req, res) => {

    TransferModel.find({ state: true }).exec((err, transfers) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            transfers
        });
    });
}

let getForId = (req, res) => {
    let id = req.params.id;

    TransferModel.findById(id).exec((err, transfer) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            transfer
        });
    });
}

let getFilterTransfer = (req, res) => {

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
        { $match: { $or: [{ branch: new ObjectId(branch) }, { destination: new ObjectId(branch) }, { date: { $gte: start, $lt: end } }] } },
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
                let: { "branch_id": "$branch" },
                pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$branch_id"] },
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            name: "$name",
                        }
                    }

                ],
                as: 'branch'
            }
        },
        {
            $lookup: {
                from: 'branches',
                let: { "destination_id": "$destination" },
                pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$_id", "$$destination_id"] },
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: "$_id",
                            name: "$name",
                        }
                    }

                ],
                as: 'destination'
            }
        },
        { $unwind: '$branch' },
        { $unwind: '$destination' },
        { $unwind: '$documentType' },
        {
            $project: {
                _id: "$_id",
                state: "$action",
                documentType: "$documentType.name",
                document: "$document",
                attachment: "$attachment",
                branch: "$branch.name",
                destination: "$destination.name",
                date: "$date",
            }
        },
        { $sort: { date: -1 } },
    ];

    TransferModel.aggregate(query).exec((err, transfers) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            transfers
        });
    });
}

let getTransferDetail = (req, res) => {
    let id = req.params.id;

    let query = [
        { $match: { _id: new ObjectId(id) } },
        {
            $lookup: {
                from: 'branches',
                localField: 'branch',
                foreignField: '_id',
                as: 'branch'
            }
        },
        { $unwind: '$branch' },
        {
            $lookup: {
                from: 'branches',
                localField: 'destination',
                foreignField: '_id',
                as: 'destination'
            }
        },
        { $unwind: '$destination' },
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
                let: { "product_id": "$product_ids", "branch_id": "$branch._id" },
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
                as: 'stock_branch'
            }
        },
        {
            $lookup: {
                from: 'stocks',
                let: { "product_id": "$product_ids", "branch_id": "$destination._id" },
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
                as: 'stock_destination'
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
                                    "stock_branch": {
                                        $arrayElemAt: [
                                            "$stock_branch",
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

        {
            $addFields: {
                "details": {
                    $map: {
                        input: "$details",
                        in: {
                            $mergeObjects: [
                                "$$this",
                                {
                                    "stock_destination": {
                                        $arrayElemAt: [
                                            "$stock_destination",
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


        { $project: { "product_ids": 0, "stock_branch": 0, "stock_destination": 0 } }
    ];

    TransferModel.aggregate(query).exec((err, transfer) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            transfer: transfer[0]
        });
    });
}

module.exports = {
    create,
    updateforId,
    deleteforId,
    getAll,
    getForId,
    getFilterTransfer,
    getTransferDetail,
    AceptTransfer
}