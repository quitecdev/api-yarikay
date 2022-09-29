const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const ClientController = require('../controller/client.controller');

const app = express();

app.post('/client', ClientController.create);
app.get('/clients', checkToken, ClientController.getAll)
app.get('/client/:id', checkToken, ClientController.getForId)
app.put('/client/:id', checkToken, ClientController.updateforId);
app.delete('/client/:id', checkToken, ClientController.deleteforId);

module.exports = app;