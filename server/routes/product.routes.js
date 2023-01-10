const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const ProductController = require('../controller/product.controller');

const app = express();

app.post('/product', checkToken, ProductController.create);
app.post('/product/import', checkToken, ProductController.importProduct);
app.get('/products', ProductController.getAll)
app.get('/product/:id', checkToken, ProductController.getForId)
app.get('/products/:branch', checkToken, ProductController.getProductStock)
app.put('/product/:id', checkToken, ProductController.updateforId);
app.delete('/product/:id', checkToken, ProductController.deleteforId);


module.exports = app;