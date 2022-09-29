const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const PatternController = require('../controller/pattern.controller');

const app = express();

app.post('/pattern', checkToken, PatternController.create);
app.get('/patterns', checkToken, PatternController.getAll)
app.get('/pattern/:id', checkToken, PatternController.getForId)
app.put('/pattern/:id', checkToken, PatternController.updateforId);
app.delete('/pattern/:id', checkToken, PatternController.deleteforId);

module.exports = app;