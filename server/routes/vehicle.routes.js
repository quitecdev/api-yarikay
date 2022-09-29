const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const VehicleController = require('../controller/vehicle.controller');

const app = express();

app.post('/vehicle', VehicleController.create);
app.get('/vehicles', VehicleController.getAll)
app.get('/vehicle/:id', VehicleController.getForId)
app.put('/vehicle/:id', VehicleController.updateforId);
app.delete('/vehicle/:id', VehicleController.deleteforId);

module.exports = app;