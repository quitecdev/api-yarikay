const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const ProviderController = require('../controller/provider.controller');

const app = express();

app.post('/provider', ProviderController.create);
app.get('/providers', checkToken, ProviderController.getAll)
app.get('/provider/:id', checkToken, ProviderController.getForId)
app.put('/provider/:id', checkToken, ProviderController.updateforId);
app.delete('/provider/:id', checkToken, ProviderController.deleteforId);

module.exports = app;