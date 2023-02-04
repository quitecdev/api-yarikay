const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const TableController = require('../controller/table.controller');

const app = express();

app.post('/table', TableController.create);
app.get('/tables', TableController.getAll)
app.get('/table/:id', TableController.getForId)
app.put('/table/:id', TableController.updateforId);
app.delete('/table/:id', TableController.deleteforId);

module.exports = app;