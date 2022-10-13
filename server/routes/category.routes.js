const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const CategoryController = require('../controller/category.controller');

const app = express();

app.post('/category', CategoryController.create);
app.get('/categories', checkToken, CategoryController.getAll)
app.get('/category/:id', checkToken, CategoryController.getForId)
app.put('/category/:id', checkToken, CategoryController.updateforId);
app.delete('/category/:id', checkToken, CategoryController.deleteforId);

module.exports = app;