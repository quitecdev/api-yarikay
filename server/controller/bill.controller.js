const SaleModel = require('../models/sale.model');
const PurchaseModel = require('../models/purchase.model');
const moment = require('moment-timezone');
const ObjectId = require('mongodb').ObjectID;
const _ = require('underscore');

//#region 
let getAllPay = (req, res) => {
    try {

        let query = [
            { $match: { 'fee.state': { $gt: 0 } } },
            {
                $project: {
                    _id: "$_id",
                    document: "$transaction.document",
                    dni: "$provider.dni",
                    provider: "$provider.name",
                    total: "$due.total",
                    payment: {
                        $sum: "$fee.records.mount"
                    },
                    balance: {
                        $subtract: ["$due.total", { $sum: "$fee.records.mount" }]
                    },
                    state: "$fee.state"
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
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getPayForId = (req, res) => {
    try {
        let id = req.params.id;

        let query = [
            { $match: { _id: new ObjectId(id) } },
            { $unwind: '$fee.records' },
            {
                $project: {
                    _id: "$fee.records._id",
                    date: "$fee.records.date",
                    mount: "$fee.records.mount",
                    method: "$fee.records.payment.method",
                    bank: "$fee.records.payment.bank",
                    number: "$fee.records.payment.number",
                    state: "$fee.records.payment.state",
                }
            },
        ];

        PurchaseModel.aggregate(query).exec((err, purchase) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
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

let getDetailPaymentForId = (req, res) => {
    let id = req.params.id;
    let detail = req.params.detail;

    let query = [{
            $addFields: {
                date: { $dateToString: { date: "$fee.records.date", timezone: "+00:00" } }
            }
        },
        { $match: { _id: new ObjectId(id), } },
        { $unwind: '$fee.records' },
        { $match: { "fee.records._id": new ObjectId(detail) } },
        {
            $project: {
                _id: "$fee.records._id",
                date: "$date",
                mount: "$fee.records.mount",
                payment: {
                    method: "$fee.records.payment.method",
                    bank: "$fee.records.payment.bank",
                    number: "$fee.records.payment.number",
                    state: "$fee.records.payment.state",
                }
            }
        },
    ];

    PurchaseModel.aggregate(query).exec((err, purchase) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            purchase: purchase[0]
        });
    });

}

let updateStatePay = (req, res) => {
    let id = req.params.id;
    let state = req.params.state;

    PurchaseModel.findByIdAndUpdate({ _id: new ObjectId(id) }, { "fee.state": state }, { new: true, runValidators: true },
        (err, purchase) => {
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
        }
    );
}

let addPay = (req, res) => {
    let body = req.body;

    let id = body.document;

    PurchaseModel.update({ _id: new ObjectId(id) }, {
            $push: {
                "fee.records": {
                    date: body.date,
                    mount: body.mount,
                    payment: body.payment
                }
            }
        },
        (err, purchase) => {
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
}

let updatePay = (req, res) => {
    let id = req.params.id;
    let pay = req.params.pay;
    let body = req.body;

    PurchaseModel.findOneAndUpdate({ "_id": id, "fee.records._id": pay }, {
            $set: {
                "fee.records.$.mount": body.mount,
                "fee.records.$.date": body.date,
                "fee.records.$.payment.method": body.payment.method,
                "fee.records.$.payment.bank": body.payment.bank,
                "fee.records.$.payment.number": body.payment.number,
                "fee.records.$.payment.state": body.payment.state,
            }
        },
        (err, purchase) => {
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

}

let removePay = (req, res) => {
        let id = req.params.id;
        let pay = req.params.pay;

        PurchaseModel.update({ "_id": new ObjectId(id), }, { $pull: { "fee.records": { "_id": new ObjectId(pay) } } },
            (err, purchase) => {
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
    }
    //#endregion

//#region Collect
let getAllCollect = (req, res) => {
    try {

        let query = [
            { $match: { 'fee.state': { $gt: 0 } } },
            {
                $project: {
                    _id: "$_id",
                    document: "$document",
                    dni: "$client.dni",
                    provider: "$client.name",
                    total: "$due.total",
                    payment: {
                        $sum: "$fee.records.mount"
                    },
                    balance: {
                        $subtract: ["$due.total", { $sum: "$fee.records.mount" }]
                    },
                    state: "$fee.state"
                }
            },
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
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getCollectForId = (req, res) => {
    try {
        let id = req.params.id;

        let query = [
            { $match: { _id: new ObjectId(id) } },
            { $unwind: '$fee.records' },
            {
                $project: {
                    _id: "$fee.records._id",
                    date: "$fee.records.date",
                    mount: "$fee.records.mount",
                    method: "$fee.records.payment.method",
                    bank: "$fee.records.payment.bank",
                    number: "$fee.records.payment.number",
                    state: "$fee.records.payment.state",
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

let getDetailCollectForId = (req, res) => {
    let id = req.params.id;
    let detail = req.params.detail;

    let query = [
        { $match: { _id: new ObjectId(id), } },
        { $unwind: '$fee.records' },
        { $match: { "fee.records._id": new ObjectId(detail) } },
        {
            $project: {
                _id: "$fee.records._id",
                date: "$fee.records.date",
                mount: "$fee.records.mount",
                payment: {
                    method: "$fee.records.payment.method",
                    bank: "$fee.records.payment.bank",
                    number: "$fee.records.payment.number",
                    state: "$fee.records.payment.state",
                }
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
            sale: sale[0]
        });
    });

}

let updateStateCollect = (req, res) => {
    let id = req.params.id;
    let state = req.params.state;

    SaleModel.findByIdAndUpdate({ _id: new ObjectId(id) }, { "fee.state": state }, { new: true, runValidators: true },
        (err, sale) => {
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
        }
    );
}

let addCollect = (req, res) => {
    let body = req.body;

    let id = body.document;

    SaleModel.update({ _id: new ObjectId(id) }, {
            $push: {
                "fee.records": {
                    date: body.date,
                    mount: body.mount,
                    payment: body.payment
                }
            }
        },
        (err, sale) => {
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
}

let updateCollect = (req, res) => {
    let id = req.params.id;
    let pay = req.params.pay;
    let body = req.body;

    SaleModel.findOneAndUpdate({ "_id": id, "fee.records._id": pay }, {
            $set: {
                "fee.records.$.mount": body.mount,
                "fee.records.$.date": body.date,
                "fee.records.$.payment.method": body.payment.method,
                "fee.records.$.payment.bank": body.payment.bank,
                "fee.records.$.payment.number": body.payment.number,
                "fee.records.$.payment.state": body.payment.state,
            }
        },
        (err, sale) => {
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

}

let removeCollect = (req, res) => {
    let id = req.params.id;
    let pay = req.params.pay;

    SaleModel.update({ "_id": new ObjectId(id), }, { $pull: { "fee.records": { "_id": new ObjectId(pay) } } },
        (err, sale) => {
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
}

//#endregion

module.exports = {
    addPay,
    getAllPay,
    updatePay,
    removePay,
    getPayForId,
    updateStatePay,
    getDetailPaymentForId,

    addCollect,
    getAllCollect,
    updateCollect,
    removeCollect,
    getCollectForId,
    updateStateCollect,
    getDetailCollectForId,

}