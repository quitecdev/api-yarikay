const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const TransferController = require('../controller/transfer.controller');

const app = express();

app.post('/transfer', checkToken, TransferController.create);
app.get('/transfers', TransferController.getAll)
app.get('/transfer/:id', TransferController.getForId)
app.put('/transfer/:id', checkToken, TransferController.updateforId);

app.delete('/transfer/:id', checkToken, TransferController.deleteforId);

app.get('/transfer/detail/:id', TransferController.getTransferDetail);
app.get('/transfers/filter/:branch', TransferController.getFilterTransfer);

app.put('/transfer/acept/:id', checkToken, TransferController.AceptTransfer);

module.exports = app;