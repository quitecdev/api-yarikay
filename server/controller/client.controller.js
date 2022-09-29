const ClientModel = require('../models/client.model');
const _ = require('underscore');

const ObjectId = require('mongodb').ObjectID;


let create = (req, res) => {

    let body = req.body;
    try {

        let client = new ClientModel({
            dni: body.dni,
            name: body.name,
            address: body.address,
            phone: body.phone,
            email: body.email,
        });

        client.save((err, client) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                client
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

        ClientModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, client) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!client) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                client
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

        ClientModel.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, client) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                client
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

        ClientModel.find({ state: true }).exec((err, clients) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                clients
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

        ClientModel.find({ _id: new ObjectId(id), state: true }).exec((err, client) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                client
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