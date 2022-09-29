const PhoneModel = require('../models/phone.model');
const PhonePriceModel = require('../models/phonePrice.model');

const _ = require('underscore');
const ObjectId = require('mongodb').ObjectID;

let create = (req, res) => {

    let body = req.body;
    try {

        let phone = new PhoneModel({
            mark: body.mark,
            pattern: body.pattern,
            name: body.name,
            initialPrice: body.initialPrice,
            salePrice: body.salePrice,
        });

        phone.save((err, phone) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            let newPrice = {
                phone: phone._id,
                price: body.initialPrice
            }

            addPrice(newPrice).then();

            res.json({
                ok: true,
                phone
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

        PhoneModel.deleteOne({ _id: new ObjectId(id) }).exec((err, phone) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!phone) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                phone
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

        let body = _.pick(req.body, ['brand', 'model', 'name', 'initialPrice', 'salePrice']);

        PhoneModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, phone) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                phone
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

        let query = [{
                $lookup: {
                    from: 'phoneprices',
                    localField: '_id',
                    foreignField: 'phone',
                    as: 'prices'
                }
            },
            { $unwind: '$prices' },
            {
                $group: {
                    _id: "$_id",
                    mark: {
                        $first: "$mark"
                    },
                    pattern: {
                        $first: "$pattern"
                    },
                    name: {
                        $first: "$name"
                    },
                    name: {
                        $first: "$name"
                    },
                    price: {
                        $avg: "$prices.price"
                    }
                }
            },
            // { $sort: { name: 1 } },
        ];
        PhoneModel.aggregate(query).exec((err, phones) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                phones
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

        PhoneModel.find({ id: id, state: true }).exec((err, phone) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                phone
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}


let createPrice = (req, res) => {

    let body = req.body;
    try {

        let phonePrice = new PhonePriceModel({
            phone: body.phone,
            price: body.price,
        });

        phonePrice.save((err, phonePrice) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                phonePrice
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getPricesForPhone = (req, res) => {
    try {
        let phone = req.params.phone;

        PhonePriceModel.find({ phone: new ObjectId(phone) }).sort({ 'created_at': -1 }).exec((err, phones) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                phones
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let addPrice = async(addPrice) => {
    const newPrice = new PhonePriceModel({
        phone: addPrice.phone,
        price: addPrice.price,
    });

    await newPrice.save();
}


let deletePriceforId = (req, res) => {
    try {
        let id = req.params.id;

        PhonePriceModel.deleteOne({ _id: new ObjectId(id) }).exec((err, phone) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!phone) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                phone
            });
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let phonesPdf = async() => {
    try {

        let query = [{
                $lookup: {
                    from: 'phoneprices',
                    localField: '_id',
                    foreignField: 'phone',
                    as: 'prices'
                }
            },
            { $unwind: '$prices' },
            {
                $group: {
                    _id: "$_id",
                    mark: {
                        $first: "$mark"
                    },
                    pattern: {
                        $first: "$pattern"
                    },
                    name: {
                        $first: "$name"
                    },
                    name: {
                        $first: "$name"
                    },
                    price: {
                        $avg: "$prices.price"
                    }
                }
            },
            // { $sort: { name: 1 } },
        ];
        return await PhoneModel.aggregate(query).exec();

    } catch (error) {

    }
}


module.exports = {
    getPricesForPhone,
    deletePriceforId,
    createPrice,
    updateforId,
    deleteforId,
    phonesPdf,
    getAll,
    getForId,
    create,
}