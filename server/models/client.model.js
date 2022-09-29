const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let clientSchema = new Schema({
    dni: {
        type: String,
        required: [true, 'Dni es requerido']
    },
    name: {
        type: String,
        required: [true, 'Nombre es requerido']
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
    state: {
        type: Boolean,
        default: true,
    }
});

clientSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('Client', clientSchema);