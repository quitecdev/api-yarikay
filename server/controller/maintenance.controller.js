const MaintenanceModel = require('../models/maintenance.model');
const _ = require('underscore');

let create = (req, res) => {

    let body = req.body;
    try {

        let maintenance = new MaintenanceModel({
            branch: body.branch,
            document: body.document,
            client: body.client,
            detail: {
                brand: body.detail.brand,
                model: body.detail.model,
                year: body.detail.year,
                motor: body.detail.motor,
                chassis: body.detail.chassis,
            },
            description: body.description,
        });

        maintenance.save((err, maintenance) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                maintenance
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

        MaintenanceModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, maintenance) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!maintenance) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                maintenance
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

        MaintenanceModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, maintenance) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                maintenance
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

        MaintenanceModel.find({ state: true }).exec((err, maintenances) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                maintenances
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

        MaintenanceModel.find({ id: id, state: true }).exec((err, maintenance) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                maintenance
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