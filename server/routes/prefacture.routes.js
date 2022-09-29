const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const PrefactureController = require('../controller/prefacture.controller');

const app = express();

app.post('/prefacture/invoice', checkToken, PrefactureController.createInvoice);
app.get('/prefactures', checkToken, PrefactureController.getAll);
app.get('/prefacture/:id', PrefactureController.getForId);
app.put('/prefacture/:id', checkToken, PrefactureController.updateforId);
app.delete('/prefacture/:id', checkToken, PrefactureController.deleteforId);

app.get('/prefactures/detail/:id', PrefactureController.getPrefactureDetail);
app.get('/prefactures/filter/:branch', PrefactureController.getFilterPrefactures);
app.get('/report/prefactures/', PrefactureController.getReportFilter);

module.exports = app;