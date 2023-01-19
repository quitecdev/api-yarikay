const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

const moment = require('moment-timezone');
const dateLocal = moment.tz(Date.now(), "America/Guayaquil").format();
const timeZone = require('mongoose-timezone');

let state = {
    values: [0, 1, 2, 3, 4],
    message: '{VALUE} no es un estado válido'
}

let Schema = mongoose.Schema;

let purchaseSchema = new Schema({
    branch: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    documentType: {
        type: Schema.ObjectId,
        ref: 'DocumentType'
    },
    transaction: {
        document: {
            type: String,
        },
        documentType: {
            type: Schema.ObjectId,
            ref: 'DocumentType'
        },
        documentFile: {
            type: String,
        },
    },
    provider: {
        type: Object,
        ref: 'Provider',
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
        purchase: {
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
    fee: {
        state: {
            type: Number,
            default: 0,
        },
        records: [{
            date: {
                type: Date,
            },
            mount: {
                type: Number,
            },
            payment: {

                method: {
                    type: Number
                },
                bank: {
                    type: String,
                    default: ''
                },
                number: {
                    type: String,
                    default: ''
                },
                state: {
                    type: Boolean,
                    default: false
                }
            }
        }]
    },
    state: {
        type: Boolean,
        default: true,
    }
});

purchaseSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
}).plugin(timeZone, { paths: ['date'] });

module.exports = mongoose.model('Purchase', purchaseSchema);