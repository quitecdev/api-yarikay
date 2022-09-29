const TaxModel = require('../models/tax.model');
const _ = require('underscore');

let create = (req, res) => {

    let body = req.body;
    try {

        let tax = new TaxModel({
            name: body.name,
            value: body.value
        });

        tax.save((err, tax) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                tax
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

        TaxModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, tax) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!tax) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                tax
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

        let body = _.pick(req.body, ['name', 'value', 'state']);

        TaxModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, tax) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                tax
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

        TaxModel.find({ state: true }).sort('name').exec((err, taxs) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                taxs
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

        TaxModel.find({ id: id, state: true }).exec((err, tax) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                tax
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