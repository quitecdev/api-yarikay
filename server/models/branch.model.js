const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let branchSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Nombre es requerido']
    },
    location: {
        address: { type: String },
        zip: { type: Number }
    },
    document: {
        establishment: { type: Number, default: 1 },
        emission: { type: Number, default: 1 },
        invoice: { type: Number, default: 1 },
        work: { type: Number, default: 1 },
        prefacture: { type: Number, default: 1 },
        note: { type: Number, default: 1 },
        purchase: { type: Number, default: 1 },
        transfer: { type: Number, default: 1 },
        cancel: { type: Number, default: 1 },
    },
    star: {
        type: Boolean,
        default: false,
    },
    state: {
        type: Boolean,
        default: true,
    },
    numeration: {
        type: Number
    }
});

branchSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});


module.exports = mongoose.model('Branch', branchSchema);