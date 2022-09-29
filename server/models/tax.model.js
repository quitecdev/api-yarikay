const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let taxSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Nombre es requerido']
    },
    value: {
        type: Number,

    },
    state: {
        type: Boolean,
        default: true,
    }
});

taxSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('Tax', taxSchema);