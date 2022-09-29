const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

const moment = require('moment-timezone');
const dateLocal = moment(new Date()).tz('America/Guayaquil');
const timeZone = require('mongoose-timezone');

let action = {
    values: [
        1, // Pendiente
        2, // Aceptado
        3 // Cancelado 
    ],
    message: '{VALUE} no es un acción válida'
};

let Schema = mongoose.Schema;

let transferSchema = new Schema({
    branch: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    destination: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    documentType: {
        type: Schema.ObjectId,
        ref: 'DocumentType'
    },
    document: {
        type: String,
    },
    date: {
        type: Date,
        default: dateLocal
    },
    details: [{
        product: {
            type: Schema.ObjectId,
            ref: 'Product'
        },
        cod: {
            type: String,
        },
        name: {
            type: String,
        },
        quantity: {
            type: Number,
        },
        state: {
            type: Boolean,
            default: false,
        }
    }],
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    attachment: {
        type: String
    },
    action: {
        type: Number,
        default: 1
    },
});

transferSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
}).plugin(timeZone, { paths: ['date'] });

module.exports = mongoose.model('Transfer', transferSchema);