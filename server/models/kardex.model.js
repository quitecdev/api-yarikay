const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

const moment = require('moment-timezone');
const dateLocal = moment.tz(Date.now(), "America/Guayaquil");
const timeZone = require('mongoose-timezone');

let Schema = mongoose.Schema;

let kardexSchema = new Schema({
    document: {
        type: String
    },
    attachment: {
        type: String
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: dateLocal
    },
    action: {
        type: Schema.ObjectId,
        ref: 'Action'
    },
    branch: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    destiny: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    details: [{
        product: {
            type: Schema.ObjectId,
            ref: 'Product'
        },
        input: {
            type: Number,
        },
        output: {
            type: Number,
        },
        existence: {
            type: Number,
        },
        total: {
            type: Number,
        }
    }],
    state: {
        type: Boolean,
        default: true,
    }
});

kardexSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
}).plugin(timeZone, { paths: ['date'] });

module.exports = mongoose.model('Kardex', kardexSchema);