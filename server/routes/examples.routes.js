const express = require('express');
const app = express();

const ExampleController = require('../controller/examples.controll');

app.get('/example/date', ExampleController.getDate);

app.get('/example/order/:branch', ExampleController.getForDay);


module.exports = app;