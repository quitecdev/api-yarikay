const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const StockController = require('../controller/stock.controller');

const app = express();

app.post('/stock', checkToken, StockController.create);
app.get('/stock/product/:branch/:product', StockController.getSockProduct);
app.get('/stock/:branch', checkToken, StockController.getStockForBranch);
app.put('/stock/:id', checkToken, StockController.updateforId);
app.put('/stock', checkToken, StockController.updateStock);
app.delete('/stock/:id', checkToken, StockController.deleteforId);

module.exports = app;