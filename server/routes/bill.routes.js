const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const BillController = require('../controller/bill.controller');

const app = express();

app.post('/bill/pay', BillController.addPay);
app.get('/bill/pay', BillController.getAllPay);
app.get('/bill/pay/:id', BillController.getPayForId);
app.get('/bill/pay/:id/:detail', BillController.getDetailPaymentForId);

app.put('/bill/pay/:id/:state', BillController.updateStatePay);
app.put('/bill/pay/update/:id/:pay', BillController.updatePay);

app.delete('/bill/pay/delete/:id/:pay', BillController.removePay);



app.post('/bill/collect', BillController.addCollect);
app.get('/bill/collect', BillController.getAllCollect);
app.get('/bill/collect/:id', BillController.getCollectForId);
app.get('/bill/collect/:id/:detail', BillController.getDetailCollectForId);

app.put('/bill/collect/:id/:state', BillController.updateStateCollect);
app.put('/bill/collect/update/:id/:pay', BillController.updateCollect);

app.delete('/bill/collect/delete/:id/:pay', BillController.removeCollect);


module.exports = app;