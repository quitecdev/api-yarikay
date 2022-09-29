const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const MarkController = require('../controller/mark.controller');

const app = express();

app.post('/mark', checkToken, MarkController.create);
app.get('/marks', checkToken, MarkController.getAll)
app.get('/mark/:id', checkToken, MarkController.getForId)
app.put('/mark/:id', checkToken, MarkController.updateforId);
app.delete('/mark/:id', checkToken, MarkController.deleteforId);

module.exports = app;