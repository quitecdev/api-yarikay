const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const CashierController = require('../controller/cashier.controller');

const app = express();

app.post('/cashier', CashierController.create);
app.get('/cashier/:branch', checkToken, CashierController.getCashier)
app.put('/cashier/:id', checkToken, CashierController.updateforId);

module.exports = app;