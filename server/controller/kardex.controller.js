const KardexModel = require('../models/kardex.model');
const StockModel = require('../models/stock.model');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;
const _ = require('underscore');

let create = (req, res) => {

    let body = req.body;

    try {

        let kardex = new KardexModel({
            document: body.document,
            attachment: body.attachment,
            user: body.user,
            action: body.action,
            branch: body.branch,
            details: body.details
        });

        kardex.save((err, kardex) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                kardex
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

        KardexModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, kardex) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!kardex) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                kardex
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

        KardexModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, kardex) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                kardex
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

        KardexModel.find({ state: true }).exec((err, kardexs) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                kardexs
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

        KardexModel.find({ id: id, state: true }).exec((err, kardex) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                kardex
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getKardexDetail = (req, res) => {
    try {

        let product = req.params.product;
        let branch = req.params.branch;

        let query = [{
                $addFields: {
                    date: { $dateToString: { date: "$date", timezone: "+00:00" } }
                }
            },
            { $match: { branch: new ObjectId(branch) } },
            {
                $addFields: {
                    "details": {
                        $filter: { // We override the existing field!
                            input: "$details",
                            as: "details",
                            cond: { $eq: ["$$details.product", new ObjectId(product)] }
                        }
                    }
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
                    from: 'actions',
                    localField: 'action',
                    foreignField: '_id',
                    as: 'action'
                }
            },

            { $unwind: '$user' },
            { $unwind: '$details' },
            { $unwind: '$action' },
            {
                $project: {
                    _id: "$_id",
                    document: "$document",
                    action: "$action.name",
                    attachment: "$attachment",
                    date: "$date",
                    user: "$user.name",
                    output: "$details.output",
                    input: "$details.input",
                    existence: "$details.existence",
                    total: "$details.total",
                }
            },
            { $sort: { date: -1 } },
        ];

        KardexModel.aggregate(query).exec((err, kardex) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                stock: kardex
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

module.exports = {
    create,
    updateforId,
    deleteforId,
    getAll,
    getForId,
    getKardexDetail
}