const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

const moment = require('moment-timezone');
const dateLocal = moment.tz(Date.now(), "America/Guayaquil");

let Schema = mongoose.Schema;

let phonePriceSchema = new Schema({
    phone: {
        type: Schema.ObjectId,
        ref: 'Phone'
    },
    price: {
        type: Number
    },
    created_at: {
        type: Date,
    }
});

phonePriceSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('PhonePrice', phonePriceSchema);