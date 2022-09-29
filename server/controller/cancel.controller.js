const CancelModel = require('../models/cancel.model');
const PdfController = require('./pdf.controller');
const _ = require('underscore');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;


let create = (req, res) => {

    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`

    let body = req.body;
    try {

        let cancel = new CancelModel({
            branch: body.branch,
            documentType: body.documentType,
            document: body.document,
            client: body.client,
            date: body.date,
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

        PdfController.pdfCredit(req, body, filename);


        cancel.save((err, cancel) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                cancel
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

        CancelModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, cancel) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!cancel) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                cancel
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

        let body = _.pick(req.body, ['branch', 'documentType', 'document', 'client', 'date', 'details', 'due', 'payment', 'user', 'prepaid', 'state']);

        CancelModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, cancel) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                cancel
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

        CancelModel.find({ state: true }).exec((err, cancels) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                cancels
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

        CancelModel.find({ id: id, state: true }).exec((err, cancel) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                cancel
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getFilterCancels = (req, res) => {
    let branch = req.params.branch;

    const dateStart = req.query.star;
    const dateEnd = req.query.end;

    var start = moment(dateStart).utc(true).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).format();
    var end = moment(dateEnd).utc(true).set({ hour: 23, minute: 59, second: 59, millisecond: 999 }).format();

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$date", timezone: "+00:00" } }
            }
        },
        { $match: { branch: new ObjectId(branch), date: { $gte: start, $lt: end }, state: true } },
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
                attachment: "$attachment",
                dni: "$client.dni",
                client: "$client.name",
                cash: "$payment.cash",
                electronic: "$payment.electronic",
                card: "$payment.card",
                total: "$due.total",
                prepaid: "$prepaid",
                date: "$date",
            }
        },
    ];


    CancelModel.aggregate(query).exec((err, cancels) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            cancels
        });
    });
}


let getCancelDetail = (req, res) => {

    let id = req.params.id;

    let query = [
        { $match: { _id: new ObjectId(id) } },
        {
            $project: {
                _id: "$_id",
                payment: "$payment",
                documentType: "$documentType.name",
                document: "$document",
                client: "$client",
                due: "$due",
                details: "$details"
            }
        },
    ];


    CancelModel.aggregate(query).exec((err, cancel) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            cancel: cancel[0]
        });
    });
}

module.exports = {
    create,
    updateforId,
    deleteforId,
    getAll,
    getForId,
    getFilterCancels,
    getCancelDetail
}