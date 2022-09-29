const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const CancelController = require('../controller/cancel.controller');

const app = express();

app.post('/cancel', checkToken, CancelController.create);
app.get('/cancels', checkToken, CancelController.getAll);
app.get('/cancel/:id', checkToken, CancelController.getForId);
app.put('/cancel/:id', checkToken, CancelController.updateforId);
app.delete('/cancel/:id', checkToken, CancelController.deleteforId);

app.get('/cancels/detail/:id', CancelController.getCancelDetail);
app.get('/cancels/filter/:branch', CancelController.getFilterCancels);

module.exports = app;