const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categorySchema = new Schema({
    name: {
        type: String,
        unique: true,
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

categorySchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('Category', categorySchema);