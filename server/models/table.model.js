const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let tableSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Nombre es requerido']
    },
    color: {
        type: String,
    },
    state: {
        type: Boolean,
        default: true,
    }
});

tableSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('Table', tableSchema);