const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const ActionController = require('../controller/action.controller');

const app = express();

app.post('/action', ActionController.create);
app.get('/actions', checkToken, ActionController.getAll)
app.get('/action/:id', checkToken, ActionController.getForId)
app.put('/action/:id', checkToken, ActionController.updateforId);
app.delete('/action/:id', checkToken, ActionController.deleteforId);

module.exports = app;