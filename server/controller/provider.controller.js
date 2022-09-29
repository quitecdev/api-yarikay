const ProviderModel = require('../models/provider.model');
const _ = require('underscore');

const ObjectId = require('mongodb').ObjectID;


let create = (req, res) => {

    let body = req.body;
    try {

        let provider = new ProviderModel({
            dni: body.dni,
            name: body.name,
            address: body.address,
            phone: body.phone,
            email: body.email,
        });

        provider.save((err, provider) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                provider
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error
        });
    }
}

let deleteforId = (req, res) => {
    try {
        let id = req.params.id;

        ProviderModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, provider) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!provider) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                provider
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

        let body = _.pick(req.body, ['dni', 'name', 'address', 'phone', 'email', 'state']);

        ProviderModel.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, provider) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                provider
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

        ProviderModel.find({ state: true }).exec((err, providers) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                providers
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

        ProviderModel.find({ _id: new ObjectId(id), state: true }).exec((err, provider) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                provider
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