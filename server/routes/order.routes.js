const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const OrderController = require('../controller/order.controller');

const app = express();

app.post('/order', OrderController.create);
app.get('/orders', checkToken, OrderController.getAll);
app.get('/order/:id', OrderController.getForId);
app.get('/ordersday/:branch', OrderController.getForDay);
app.get('/orderskitchen/:branch', OrderController.getOrderKitchen);
app.put('/order/:id', checkToken, OrderController.updateforId);
app.put('/order/state/:id/:state', OrderController.updateStateOrder);
app.delete('/order/:id', checkToken, OrderController.deleteforId);

module.exports = app;