const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const KardexController = require('../controller/kardex.controller');

const app = express();

app.post('/kardex', checkToken, KardexController.create);
app.get('/kardexs', checkToken, KardexController.getAll)
app.get('/kardex/:id', checkToken, KardexController.getForId)
app.put('/kardex/:id', checkToken, KardexController.updateforId);
app.delete('/kardex/:id', checkToken, KardexController.deleteforId);
//report
app.get('/kardex/detail/:product/:branch', KardexController.getKardexDetail)


module.exports = app;