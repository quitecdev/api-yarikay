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

let prefactureSchema = new Schema({
    branch: {
        type: Schema.ObjectId,
        ref: 'Branch'
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
        prefacture: {
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
        type: Number,
        default: 1,
    }
});

prefactureSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
}).plugin(timeZone, { paths: ['date'] });

module.exports = mongoose.model('Prefacture', prefactureSchema);