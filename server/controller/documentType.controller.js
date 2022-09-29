const DocumentTypeModel = require('../models/documentType.model');
const _ = require('underscore');

let create = (req, res) => {

    let body = req.body;
    try {

        let documentType = new DocumentTypeModel({
            name: body.name
        });

        documentType.save((err, documentType) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                documentType
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

        DocumentTypeModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, documentType) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!documentType) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                documentType
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

        DocumentTypeModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, documentType) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                documentType
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

        DocumentTypeModel.find({ state: true }).exec((err, documentTypes) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                documentTypes
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

        DocumentTypeModel.find({ id: id, state: true }).exec((err, documentType) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                documentType
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