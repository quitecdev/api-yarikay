const express = require('express');
const app = express();

const PdfController = require("../controller/pdf.controller");

app.get('/pdf/sale/:id', PdfController.pdfExample);
app.get('/pdf/work/:id/:filename', PdfController.pdfWorkShop);
app.get('/pdf/prefacture/:id/:filename', PdfController.pdfPrefacture);
app.get('/pdf/invoice/regenerate/:id', PdfController.pdfInvoiceRegenerate);

module.exports = app;