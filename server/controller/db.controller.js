const express = require('express');
const app = express();
const mongoose = require('mongoose');


mongoose.set('useFindAndModify', false);

// Le indicamos a Mongoose que haremos la conexión con Promesas
mongoose.Promise = global.Promise;

// Usamos el método connect para conectarnos a nuestra base de datos
mongoose.connect(process.env.URL_DBO, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then((resp) => {
        // Cuando se realiza la conexión, lanzamos este mensaje por consola
        console.log('La conexión a MongoDB se ha realizado correctamente!!');

    })
    .catch(err => console.log(err));
// Si no se conecta correctamente escupimos el error
module.exports = app;