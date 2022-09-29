const ActionModel = require('../models/action.model');
const _ = require('underscore');

let create = (req, res) => {

    let body = req.body;
    try {

        let action = new ActionModel({
            name: body.name
        });

        action.save((err, action) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                action
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

        ActionModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, action) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!action) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                action
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

        ActionModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, action) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                action
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

        ActionModel.find({ state: true }).exec((err, actions) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                actions
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

        ActionModel.find({ id: id, state: true }).exec((err, action) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                action
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