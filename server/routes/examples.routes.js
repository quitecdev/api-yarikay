const express = require('express');
const app = express();

const ExampleController = require('../controller/examples.controll');

app.get('/example/date', ExampleController.getDate);

module.exports = app;