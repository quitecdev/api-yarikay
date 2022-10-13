let createOrder = (cliente, io) => {
    cliente.on('createOrder', (payload) => {
        console.log('Create Order');
        io.emit('update-kitchen');
    });
}

let updateOrder = (cliente, io) => {
    cliente.on('updateOrder', () => {
        console.log('Update Order');
        io.emit('update-kitchen');
    });
}

let cancelOrder = (cliente, io) => {
    cliente.on('cancelOrder', () => {
        console.log('Cancel Order');
        io.emit('update-kitchen');
    });
}

let UpdateOrderDetail = (cliente, io) => {
    cliente.on('updateOrderDetail', () => {
        console.log('Update Order Detail');
        io.emit('update-kitchen');
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
    updateOrder,
    UpdateOrderDetail,
    cancelOrder
}