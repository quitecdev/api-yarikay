const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const uniqueValidater = require('mongoose-unique-validator');

const moment = require('moment-timezone');
const dateLocal = moment.tz(Date.now(), "America/Guayaquil").format();

let Schema = mongoose.Schema;

let orderSchema = new Schema({
    branch: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    number: {
        type: Number
    },
    name: {
        type: String
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
        timer: {
            type: Date,
            default: Date
        },
        composed: {
            type: Boolean,
            default: false,
        },
        state: {
            type: Number,
            default: 0
        },
        paid: {
            type: Boolean,
            default: false,
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
    .plugin(AutoIncrement, { id: 'number_seq', inc_field: 'number' });

module.exports = mongoose.model('Order', orderSchema);