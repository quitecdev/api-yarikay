const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const SaleController = require('../controller/sale.controller');
const InvoiceController = require('../controller/invoice.controller')
const app = express();

app.post('/sale/invoice', checkToken, SaleController.createInvoice);
app.post('/sale/note', checkToken, SaleController.createNote);
app.post('/sale/credit', checkToken, SaleController.createCredit);
app.get('/sales', SaleController.getAll);
app.get('/sale/:id', SaleController.getForId);
app.put('/sale/:id', checkToken, SaleController.updateforId);
app.put('/sale/number/:id', SaleController.updateDocumentNumber);
app.delete('/sale/:id', checkToken, SaleController.deleteforId);

app.get('/sales/detail/:id', SaleController.getSaleDetail);
app.get('/sales/filter/:branch', SaleController.getFilterSales);
app.get('/sales/product/:branch', SaleController.getFilterProducts);
app.get('/report/sales/', SaleController.getReportFilter);

app.get('/invoice/accescode', InvoiceController.getAllInvoices);
app.get('/sales/filename/:filename', SaleController.getSaleForFilename);
module.exports = app;