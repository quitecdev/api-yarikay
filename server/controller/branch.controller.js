const BranchModel = require('../models/branch.model');
const StockController = require('../controller/stock.controller');
const ObjectId = require('mongodb').ObjectID;
const _ = require('underscore');


let create = (req, res) => {

    let body = req.body;
    try {

        let branch = new BranchModel({
            name: body.name,
            location: {
                address: body.location.address,
                zip: body.location.zip,
            },
            document: {
                establishment: body.document.establishment,
                emission: body.document.emission,
                invoice: body.document.invoice,
                note: body.document.note,
                work: body.document.work,
                prefacture: body.document.prefacture,
            },
            star: body.star,
            numeration: body.numeration
        });

        branch.save((err, branch) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            StockController.createStockNewBranch(branch);

            res.json({
                ok: true,
                branch
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

    let id = req.params.id;

    BranchModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, branch) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!branch) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El id no existe' }
            });
        }

        res.json({
            ok: true,
            branch
        });
    });
}

let updateforId = (req, res) => {

    let id = req.params.id;

    let body = _.pick(req.body, ['name', 'location', 'document', 'star', 'state', 'numeration']);

    BranchModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, branch) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            branch
        });

    });
}

let getAll = (req, res) => {

    BranchModel.find({ state: true }).exec((err, branchs) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            branchs
        });
    });
}

let getForId = (req, res) => {
    let id = req.params.id;

    BranchModel.findById(id).exec((err, branch) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            branch
        });
    });
}

module.exports = {
    create,
    updateforId,
    deleteforId,
    getAll,
    getForId
}