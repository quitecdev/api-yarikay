const PurchaseModel = require('../models/purchase.model');
const PdfController = require('./pdf.controller');
const _ = require('underscore');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;

let create = (req, res) => {

    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`

    let body = req.body;
    try {

        let purchase = new PurchaseModel({
            branch: body.branch,
            documentType: body.documentType,
            document: body.document,
            documentFile: body.documentFile,
            transaction: {
                document: body.transaction.document,
                documentType: body.transaction.documentType,
                documentFile: body.transaction.documentFile,
            },
            provider: body.provider,
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
            fee: body.fee,
            user: body.user,
            attachment: filename,
            prepaid: body.prepaid
        });

        PdfController.pdfPurchase(req, body, filename);


        purchase.save((err, purchase) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                purchase
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

        PurchaseModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, purchase) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!purchase) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                purchase
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

        let body = _.pick(req.body, ['branch', 'documentType', 'document', 'client', 'date', 'details', 'due', 'payment', 'user', 'state', 'prepaid', 'fee']);

        PurchaseModel.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, purchase) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                purchase
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

        PurchaseModel.find({ state: true }).exec((err, purchases) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                purchases
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

        PurchaseModel.find({ _id: new ObjectId(id) }).exec((err, purchase) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                purchase: purchase[0]
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getFilterPurchase = (req, res) => {
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
        { $match: { branch: new ObjectId(branch), date: { $gte: start, $lt: end }, state: true } },
        {
            $lookup: {
                from: 'documenttypes',
                localField: 'transaction.documentType',
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
                attachment: "$attachment",
                dni: "$provider.dni",
                provider: "$provider.name",
                transaction: "$transaction.document",
                total: "$due.total",
                prepaid: "$prepaid",
                date: "$date",
                state: "$state"
            }
        },
    ];


    PurchaseModel.aggregate(query).exec((err, purchases) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            purchases
        });
    });
}


module.exports = {
    create,
    updateforId,
    deleteforId,
    getAll,
    getForId,
    getFilterPurchase
}