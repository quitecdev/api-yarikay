const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let markSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Nombre es requerido']
    },
    short: {
        type: String,
    },
    state: {
        type: Boolean,
        default: true,
    }
});

markSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('Mark', markSchema);