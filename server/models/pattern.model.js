const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let patternSchema = new Schema({
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

patternSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('Pattern', patternSchema);