const ProductModel = require('../models/product.model');
const StockModel = require('../models/stock.model');
const StockController = require('../controller/stock.controller');
const ObjectId = require('mongodb').ObjectID;

const _ = require('underscore');
const { result } = require('underscore');

let create = (req, res) => {

    let body = req.body;
    try {

        let product = new ProductModel({
            cod: body.cod,
            mark: body.mark,
            pattern: body.pattern,
            category: body.category,
            name: body.name,
            composed: body.composed,
            price: {
                purchase: body.price.purchase,
                sale: body.price.sale,
                minimum: body.price.minimum,
                iva: body.price.iva
            },
            tags: body.tags,
            description: body.description,
            detail: body.detail,
            images: body.images,
        });



        product.save((err, product) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            StockController.createStockAllBranch(product);

            res.json({
                ok: true,
                product
            });
        });



    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let importProduct = (req, res) => {

    let body = req.body;
    try {

        let product = new ProductModel({
            cod: body.cod,
            mark: body.mark,
            pattern: body.pattern,
            category: body.category,
            name: body.name,
            composed: body.composed,
            price: {
                purchase: body.price.purchase,
                sale: body.price.sale,
                minimum: body.price.minimum,
                iva: body.price.iva
            },
            tags: body.tags,
            description: body.description,
            detail: body.detail,
            images: body.images,
        });

        product.save((err, product) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            StockController.inicialStockAllBranch(product, body.existence);

            res.json({
                ok: true,
                product
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

        ProductModel.findByIdAndUpdate(id, { state: false }, { new: true, runValidators: true }, (err, product) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!product) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'El id no existe' }
                });
            }

            res.json({
                ok: true,
                product
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

        let body = _.pick(req.body, ['cod', 'mark', 'pattern', 'category', 'name', 'composed', 'price', 'tags', 'description', 'detail', 'images', 'state']);
        // console.log(body);

        console.log(body);
        ProductModel.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, product) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if (!product) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe',
                    }
                });
            }
            res.json({
                ok: true,
                product
            });

        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getAll = (req, res) => {
    try {

        ProductModel
            .find({ state: true })
            .populate({
                path: 'category',
                model: 'Category'
            })
            .populate({
                path: 'mark',
                model: 'Mark'
            })
            .populate({
                path: 'pattern',
                model: 'Pattern'
            })
            .exec((err, products) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    products
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

        ProductModel.find({ _id: new ObjectId(id) }).exec((err, product) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                product
            });
        });
    } catch (error) {
        return res.status(400).json({
            ok: false,
            err: error.message
        });
    }
}

let getProductStock = (req, res) => {
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
        {
            $project: {
                _id: "$product._id",
                cod: "$product.cod",
                category: { "$arrayElemAt": ["$category", 0] },
                mark: { "$arrayElemAt": ["$mark", 0] },
                pattern: { "$arrayElemAt": ["$pattern", 0] },
                name: "$product.name",
                price: "$product.price",
                state: "$product.state",
                composed: "$product.composed",
                existence: "$existence",
            }
        },
    ];

    StockModel.aggregate(query).exec((err, products) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            products
        });
    });
}


// getChildren = function() {
//     return this.model("Item").find({hierarchy: this._id, hierarchy_size: this.hierarchy_size+1})
//     .exec()
//     .then(result => {
//         let childrenHierarchy = [];
//             for(let child of children){
//                 childrenHierarchy.push(child);
//             }
//             return childrenHierarchy;
//     })
//     .catch(err => {
//         console.log("the error occured!", err)
//     })
// };


module.exports = {
    create,
    importProduct,
    updateforId,
    deleteforId,
    getAll,
    getForId,
    getProductStock,
}