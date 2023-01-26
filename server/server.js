const NODE_ENV = process.env.NODE_ENV || 'dev'
try {
    if (NODE_ENV == 'dev') {
        require('dotenv').config();
    }

    const methodOverride = require('method-override');
    const express = require('express');
    const app = express();


    const cors = require('cors')
    app.use(cors())

    const bodyParser = require('body-parser');

    const path = require('path');

    var http = require("http").Server(app);

    const Global = require('./sockets/global')

    app.use(function(req, res, next) {

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

        next();

    });

    app.use('/files/documents', express.static(__dirname + '/public'));

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    // parse application/json
    app.use(bodyParser.json())
    app.use(express.json());
    app.use(methodOverride('_method'));

    //Configuracion Global de rutas
    app.use(require('./routes/index'));

    //Configuracion DB
    app.use(require('./controller/db.controller'));

    const server = app.listen(process.env.PORT, () => {
        console.log('Escuchando puerto: ', process.env.PORT);
    });

    // WebSockets
    const SokcetIO = require('socket.io');
    const io = SokcetIO(server, { origin: '*:*' });
    const SocketController = require('./sockets/index.sockets');
    const { Socket } = require('dgram');

    io.on('connection', socket => {

        console.log('Connected client');

        const handshake = socket.id;

        let { nameRoom } = socket.handshake.query;

        console.log(`Nuevo dispositivo: ${handshake} conentado a la ${nameRoom}`);

        socket.join(nameRoom);

        SocketController.createOrder(socket, io);
        //Finalize Order
        SocketController.finalizeOrder(socket, io);
        //Update Order Detail
        SocketController.updateOrderDetail(socket, io);
        //Disconnect
        SocketController.disconnect(socket, io);
    })
} catch (error) {
    console.log(error);
}