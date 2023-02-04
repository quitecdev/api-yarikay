const express = require('express');
const app = express();

app.use(require('./user.routes'));
app.use(require('./branch.routes'));
app.use(require('./bill.routes'));
app.use(require('./category.routes'));
app.use(require('./mark.routes'));
app.use(require('./pattern.routes'));
app.use(require('./product.routes'));
app.use(require('./tax.routes'));
app.use(require('./action.routes'));
app.use(require('./stock.routes'));
app.use(require('./kardex.routes'));
app.use(require('./documentType.routes'));
app.use(require('./client.routes'));
app.use(require('./sale.routes'));
app.use(require('./pdf.routes'));
app.use(require('./file.routes'));
app.use(require('./provider.routes'));
app.use(require('./purchase.routes'));
app.use(require('./transfer.routes'));
app.use(require('./dashboard.routes'));
app.use(require('./cashier.routes'));
app.use(require('./cancel.routes'));
app.use(require('./phone.routes'));
app.use(require('./vehicle.routes'));
app.use(require('./prefacture.routes'));
app.use(require('./workshop.routes'));
app.use(require('./order.routes'));
app.use(require('./table.routes'));
app.use(require('./examples.routes'));


module.exports = app;