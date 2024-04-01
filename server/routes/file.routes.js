const express = require('express');
const FileController = require('../controller/file.controller');
const app = express();

var multer = require('multer');
var upload = multer();

app.get('/file/document/:filename', FileController.getFile);
app.get('/files', FileController.getAllFiles);
app.get('/file/:filename', FileController.getFile);
app.get('/file/check/:filename', FileController.getFileForName);
app.post('/file/upload', upload.single('file'), FileController.uploadFile);
app.post('/file/upload/base64', FileController.uploadFileBase);

app.delete('/file/:id', FileController.deleteforId);

module.exports = app;