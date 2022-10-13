const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const uniqueValidater = require('mongoose-unique-validator');
const moment = require('moment-timezone');
const dateLocal = moment.tz(Date.now(), "America/Guayaquil");
const timeZone = require('mongoose-timezone');

let Schema = mongoose.Schema;

let orderSchema = new Schema({
    branch: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    number: {
        type: Number
    },
    table: {
        type: Number,
        required: [true, 'Mesa es requerido']
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
            default: 1
        },
        observation: {
            type: String,
        },
        composed: {
            type: Boolean,
            default: false,
        },
        state: {
            type: Number,
            default: 0
        }
    }],
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    state: {
        type: Number,
        default: 0,
    }
});

orderSchema
    .plugin(AutoIncrement, { id: 'number_seq', inc_field: 'number' })
    .plugin(timeZone, { paths: ['date'] });

module.exports = mongoose.model('Order', orderSchema);