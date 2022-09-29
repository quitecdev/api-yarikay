const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const DocumentTypeController = require('../controller/documentType.controller');

const app = express();

app.post('/documentType', DocumentTypeController.create);
app.get('/documentTypes', checkToken, DocumentTypeController.getAll)
app.get('/documentType/:id', checkToken, DocumentTypeController.getForId)
app.put('/documentType/:id', checkToken, DocumentTypeController.updateforId);
app.delete('/documentType/:id', checkToken, DocumentTypeController.deleteforId);

module.exports = app;