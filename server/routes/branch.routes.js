const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const BranchController = require('../controller/branch.controller');

const app = express();

app.post('/branch', checkToken, BranchController.create);
app.get('/branchs', BranchController.getAll)
app.get('/branch/:id', BranchController.getForId)
app.put('/branch/:id', checkToken, BranchController.updateforId);
app.delete('/branch/:id', checkToken, BranchController.deleteforId);

module.exports = app;