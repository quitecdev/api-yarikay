const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const DashboardController = require('../controller/dashboard.controller');

const app = express();

app.get('/dashboard/count/products', DashboardController.getCountProduct);
app.get('/dashboard/count/kardex/:branch', DashboardController.getCountKardex);
app.get('/dashboard/count/sales/:branch', DashboardController.getCountSales);
app.get('/dashboard/count/total/:branch', DashboardController.getSaleTotal);
app.get('/dashboard/details/sales/:branch', DashboardController.getDetailSales);



module.exports = app;