const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const WorkShopController = require('../controller/workShop.controller');

const app = express();

app.post('/workshop', WorkShopController.create);
app.get('/workshops', WorkShopController.getAll)
app.get('/workshop/:id', WorkShopController.getForId)
app.put('/workshop/:id', WorkShopController.updateforId);
app.delete('/workshop/:id', WorkShopController.deleteforId);

module.exports = app;