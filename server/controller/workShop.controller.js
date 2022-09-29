const WorkShopModel = require('../models/workshop.model');
const PdfController = require('../controller/pdf.controller');
const _ = require('underscore');

let create = (req, res) => {

    let filename = `${Math.random().toString(36).substring(2, 15)}.pdf`

    let body = req.body;
    try {

        let workShop = new WorkShopModel({
            vehicle: body.vehicle,
            mileage: body.mileage,
            work: body.work,
            bodywork: body.bodywork,
            document: body.document,
            attachment: filename,
        });

        workShop.save((err, workShop) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                workShop
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

        WorkShopModel.findByIdAndUpdate(id, { state: 0 }, { new: true, runValidators: true }, (err, workShop) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!workShop) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                workShop
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

        let body = _.pick(req.body, ['vehicle', 'mileage', 'date', 'work', 'bodywork', 'state']);

        WorkShopModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, workShop) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                workShop
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

        const query = [{
                $lookup: {
                    from: 'vehicles',
                    localField: 'vehicle',
                    foreignField: '_id',
                    as: 'vehicle'
                }
            },
            { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'vehicle.client',
                    foreignField: 'dni',
                    as: 'client'
                }
            },
            {
                $addFields: {
                    "vehicle.client": { "$arrayElemAt": ["$client", 0] }
                }
            }
        ];


        WorkShopModel.aggregate(query).sort('name').exec((err, workShops) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                workShops
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
        WorkShopModel.find({ _id: id }).exec((err, workShop) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                workShop: workShop[0]
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
    getForId
}