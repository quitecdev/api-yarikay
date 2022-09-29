const VehicleModel = require('../models/vehicle.model');
const _ = require('underscore');

const ObjectId = require('mongodb').ObjectID;


let create = (req, res) => {

    let body = req.body;
    try {

        let vehicle = new VehicleModel({
            client: body.client.dni,
            licenceplate: body.licenceplate,
            mark: body.mark,
            model: body.model,
            year: body.year,
            color: body.color,
        });

        vehicle.save((err, vehicle) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                vehicle
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

        VehicleModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, vehicle) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!vehicle) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                vehicle
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

        VehicleModel.remove({ _id: new ObjectId(id) }, (err, vehicle) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                vehicle
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

        const query = [
            { $match: { state: true } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'client',
                    foreignField: 'dni',
                    as: 'client'
                }
            },
            {
                $project: {
                    _id: "$_id",
                    licenceplate: "$licenceplate",
                    client: { "$arrayElemAt": ["$client", 0] },
                    mark: "$mark",
                    model: "$model",
                    year: "$year",
                    color: "$color"
                }
            }
        ];

        VehicleModel.aggregate(query).exec((err, vehicles) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                vehicles
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

        VehicleModel.find({ _id: new ObjectId(id), state: true }).exec((err, vehicle) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                vehicle
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