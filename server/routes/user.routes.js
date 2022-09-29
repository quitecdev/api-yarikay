const express = require('express');
const { checkToken } = require('../middlewares/authentication');
const UserController = require('../controller/user.controller');

const app = express();

app.post('/user', UserController.create);
app.get('/users', UserController.getAll);
app.get('/user/:id', checkToken, UserController.getForId);
app.get('/user/branch/:branch', UserController.getUserForBranch);
app.put('/user/:id', checkToken, UserController.updateforId);
app.delete('/user/:id', checkToken, UserController.deleteforId);

app.post('/auth/login', UserController.login)

module.exports = app;