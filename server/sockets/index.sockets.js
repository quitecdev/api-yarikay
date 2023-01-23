const Global = require('./global')

let createOrder = (cliente, io) => {

    cliente.on(Global.createOrder, (payload) => {
        io.emit(Global.alertnewOrder, payload);
    });
}

let finalizeOrder = (cliente, io) => {
    cliente.on(Global.finalizeOrder, (payload) => {
        io.emit(Global.alertFinalizeOrder, payload);
    });
}

let updateOrderDetail = (cliente, io) => {
    cliente.on(Global.updateOrderDetail, (payload) => {
        io.emit(Global.alertUpdateOrderDetail, payload);
    });
}

let disconnect = (cliente, io) => {
    cliente.on('disconnect', () => {
        console.log('Disconnected client');
    });
}

module.exports = {
    disconnect,
    createOrder,
    finalizeOrder,
    updateOrderDetail
}