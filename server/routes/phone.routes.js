const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const PhoneController = require('../controller/phone.controller');

const app = express();

app.post('/phone', PhoneController.create);
app.get('/phones', PhoneController.getAll)
app.get('/phone/:id', PhoneController.getForId)
app.put('/phone/:id', PhoneController.updateforId);
app.delete('/phone/:id', PhoneController.deleteforId);

app.post('/phone/price', PhoneController.createPrice);
app.get('/phone/prices/:phone', PhoneController.getPricesForPhone);
app.delete('/phone/price/:id', PhoneController.deletePriceforId);

module.exports = app;