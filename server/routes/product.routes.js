const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const ProductController = require('../controller/product.controller');
var multer = require('multer');
var upload = multer();
const app = express();

app.post('/product', checkToken, ProductController.create);
app.post('/product/import', checkToken, ProductController.importProduct);
app.get('/products', ProductController.getAll)
app.get('/product/:id', checkToken, ProductController.getForId)
app.get('/products/:branch', checkToken, ProductController.getProductStock)
app.put('/product/:id', checkToken, ProductController.updateforId);
app.delete('/product/:id', checkToken, ProductController.deleteforId);


app.get('/products/update/name', ProductController.updateNameProduct);
app.post('/product/xls', upload.single('file'), ProductController.UpdateForExcel);


module.exports = app;