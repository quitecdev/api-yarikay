const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const PurchaseController = require('../controller/purchase.controller');

const app = express();

app.post('/purchase', checkToken, PurchaseController.create);
app.get('/purchases', checkToken, PurchaseController.getAll)
app.get('/purchase/:id', PurchaseController.getForId)
app.put('/purchase/:id', checkToken, PurchaseController.updateforId);
app.delete('/purchase/:id', checkToken, PurchaseController.deleteforId);


app.get('/purchase/filter/:branch', PurchaseController.getFilterPurchase);


module.exports = app;