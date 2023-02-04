const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const uniqueValidater = require('mongoose-unique-validator');

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
        type: Schema.ObjectId,
        ref: 'Table'
    },
    date: {
        type: Date,
        default: () => { return new Date() }
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
        unitary: {
            type: Number
        },
        subotal: {
            type: Number
        },
        iva: {
            type: Boolean
        },
        sale: {
            type: Number,
        },
        total: {
            type: Number
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
    due: {
        subTotal: {
            type: Number
        },
        tax: {
            type: Number
        },
        total: {
            type: Number
        }
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    attachment: {
        type: String
    },
    state: {
        type: Number,
        default: 0,
    }
});

orderSchema
    .plugin(AutoIncrement, { id: 'number_seq', inc_field: 'number' });

module.exports = mongoose.model('Order', orderSchema);