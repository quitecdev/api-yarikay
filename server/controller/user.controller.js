const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('underscore');

const ObjectId = require('mongodb').ObjectID;

const UserModel = require('../models/user.model');

const app = express();

let create = (req, res) => {
    let body = req.body;

    try {

        let user = new UserModel({
            email: body.email,
            name: body.name,
            password: bcrypt.hashSync(body.password, 10),
            branch: body.branch,
            role: body.role,
        });

        user.save((err, user) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                user
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            error
        });
    }
}



let updateforId = (req, res) => {

    let id = req.params.id;

    let body;
    if (req.body.password) {
        body = _.pick(req.body, ['email', 'name', 'password', 'branch', 'role', 'state', 'changePass']);
        body.password = bcrypt.hashSync(body.password, 10);

    } else {
        body = _.pick(req.body, ['email', 'name', 'branch', 'role', 'state', 'changePass']);
    }

    UserModel.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            user
        });
    });
}

let deleteforId = (req, res) => {

    let id = req.params.id;

    UserModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El id no existe' }
            });
        }

        res.json({
            ok: true,
            user
        });
    });
}

let getAll = (req, res) => {

    const query = [
        { $match: { state: true } },
        {
            $lookup: {
                from: 'branches',
                localField: 'branch',
                foreignField: "_id",
                as: "branch"
            }
        },
    ]

    UserModel.aggregate(query).exec((err, users) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            users
        });
    });
}

let getForId = (req, res) => {
    let id = req.params.id;

    UserModel.find({ _id: new ObjectId(id), state: true }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            user
        });
    });

}

let getUserForBranch = (req, res) => {
    let branch = req.params.branch;

    UserModel.aggregate([

        { $match: { branch: new ObjectId(branch) } },
        {
            $lookup: {
                from: "branches",
                localField: "branch",
                foreignField: "_id",
                as: "branches",
            }
        },
        {
            $project: {
                _id: "$_id",
                role: "$role",
                state: "$state",
                email: "$email",
                changePass: "$changePass",
                name: "$name",
                branch: "$branches",
                password: "$password",
            }
        }
    ]).exec((err, users) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            users
        });
    });

}

let login = (req, res) => {
    let body = req.body;
    try {
        UserModel.aggregate([
            { $match: { "email": body.email } },
            {
                $lookup: {
                    from: "branches",
                    localField: "branch",
                    foreignField: "_id",
                    as: "branches",
                }
            },
            {
                $project: {
                    _id: "$_id",
                    role: "$role",
                    state: "$state",
                    email: "$email",
                    changePass: "$changePass",
                    name: "$name",
                    branch: "$branches",
                    password: "$password",
                }
            }
        ]).exec((err, user) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!user.length > 0) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario o contraseña iconrrecto',
                    }
                });
            }

            if (!bcrypt.compareSync(body.password, user[0].password)) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario o contraseña iconrrecto',
                    }
                });
            }

            let token = jwt.sign({ user: user[0] }, process.env.SEDD, { expiresIn: process.env.CADUCIDAD_TOKEN });

            return res.json({
                ok: true,
                user: user[0],
                token
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            error
        });
    }
}

module.exports = {
    create,
    login,
    getAll,
    getForId,
    updateforId,
    deleteforId,
    getUserForBranch
}