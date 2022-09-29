const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let documentTypeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Nombre es requerido']
    },
    state: {
        type: Boolean,
        default: true,
    }
});

documentTypeSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('DocumentType', documentTypeSchema);