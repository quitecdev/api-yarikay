const StockModel = require('../models/stock.model');
const BranchModel = require('../models/branch.model');
const ProductModel = require('../models/product.model');

const ObjectId = require('mongodb').ObjectID;
const _ = require('underscore');

let create = (req, res) => {

    let body = req.body;
    try {

        let stock = new StockModel({
            branch: body.branch,
            product: body.product,
            existence: body.existence,
        });

        stock.save((err, stock) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                stock
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

        StockModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, stock) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!stock) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                stock
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

        let body = _.pick(req.body, ['branch', 'product', 'existence']);

        StockModel.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, stock) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                stock
            });

        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let updateStock = (req, res) => {
    try {

        let body = req.body;
        let product = body.product;
        let branch = body.branch;
        let existence = body.existence;

        StockModel.findOneAndUpdate({ branch, product }, { $set: { existence } }, { new: true }, (err, stock) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                stock
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

        StockModel.find({ state: true }).exec((err, stocks) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                stocks
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

        StockModel.find({ id: id, state: true }).exec((err, stock) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                stock
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getStockForBranch = (req, res) => {
    let branch = req.params.branch;

    const query = [
        { $match: { branch: new ObjectId(branch) } },
        {
            $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'product.category',
                foreignField: '_id',
                as: 'category'
            }
        },

        {
            $lookup: {
                from: 'marks',
                localField: 'product.mark',
                foreignField: '_id',
                as: 'mark'
            }
        },
        {
            $lookup: {
                from: 'patterns',
                localField: 'product.pattern',
                foreignField: '_id',
                as: 'pattern'
            }
        },
        { $unwind: '$category' },
        { $unwind: '$mark' },
        { $unwind: '$pattern' },
        {
            $project: {
                _id: "$product._id",
                branch: "$branch",
                cod: "$product.cod",
                name: "$product.name",
                category: "$category.name",
                mark: "$mark.name",
                pattern: "$pattern.name",
                existence: "$existence",
                stock: "$_id"
            }
        },

    ];

    StockModel.aggregate(query).exec((err, stocks) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            stocks
        });
    });

}

let createStockAllBranch = (product) => {
    BranchModel.find().exec((err, branches) => {
        branches.forEach(branch => {

            let stock = new StockModel({
                branch: branch._id,
                product: product._id,
                existence: 0,
            });

            stock.save();

        });
    });
}

let inicialStockAllBranch = (product, existence) => {
    BranchModel.find().exec((err, branches) => {
        branches.forEach(branch => {

            let stock = new StockModel({
                branch: branch._id,
                product: product._id,
                existence: existence,
            });

            stock.save();

        });
    });
}


let createStockNewBranch = (branch) => {
    ProductModel.find().exec((err, products) => {
        products.forEach(product => {
            let stock = new StockModel({
                branch: branch._id,
                product: product._id,
                existence: 0,
            });

            stock.save();
        });
    });
}

getSockProduct = (req, res) => {
    let branch = req.params.branch;
    let product = req.params.product;

    StockModel.find({ branch, product }).exec((err, stock) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            stock: stock[0]
        });
    });

}




module.exports = {
    create,
    updateforId,
    deleteforId,
    getAll,
    getForId,
    getStockForBranch,
    updateStock,
    createStockAllBranch,
    getSockProduct,
    inicialStockAllBranch,
    createStockNewBranch
}