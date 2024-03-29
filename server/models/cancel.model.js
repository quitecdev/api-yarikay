const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

const moment = require('moment-timezone');
const dateLocal = moment.tz(Date.now(), "America/Guayaquil").format();
const timeZone = require('mongoose-timezone');

let Schema = mongoose.Schema;

let cancelSchema = new Schema({
    branch: {
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
    client: {
        type: Object,
        ref: 'Client',
        field: 'dni'
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
        unitary: {
            type: Number
        },
        subotal: {
            type: Number
        },
        iva: {
            type: Boolean
        },
        cancel: {
            type: Number,
        },
        total: {
            type: Number
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
    payment: {
        cash: {
            type: Number,
            default: 0
        },
        electronic: {
            type: Number,
            default: 0
        },
        card: {
            type: Number,
            default: 0
        },
        bank: {
            type: String,
            default: ''
        },
        baucher: {
            type: String,
            default: ''
        },
        account: {
            type: String,
            default: ''
        },
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    attachment: {
        type: String
    },
    prepaid: {
        type: Boolean,
        default: false,
    },
    images: [String],
    state: {
        type: Boolean,
        default: true,
    }
});

cancelSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
}).plugin(timeZone, { paths: ['date'] });

module.exports = mongoose.model('Cancel', cancelSchema);