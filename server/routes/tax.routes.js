const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const TaxController = require('../controller/tax.controller');

const app = express();

app.post('/tax', TaxController.create);
app.get('/taxes', TaxController.getAll)
app.get('/tax/:id', checkToken, TaxController.getForId)
app.put('/tax/:id', checkToken, TaxController.updateforId);
app.delete('/tax/:id', checkToken, TaxController.deleteforId);

module.exports = app;