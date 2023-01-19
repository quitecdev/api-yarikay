const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

const moment = require('moment-timezone');
const dateLocal = moment.tz(Date.now(), "America/Guayaquil");
const timeZone = require('mongoose-timezone');

let state = {
    values: [0, 1, 2, 3, 4],
    message: '{VALUE} no es un estado válido'
}

let Schema = mongoose.Schema;

let workShopSchema = new Schema({
    vehicle: {
        type: Schema.ObjectId,
        ref: 'Vehicle'
    },
    document: {
        type: String,
    },
    attachment: {
        type: String
    },
    mileage: {
        type: Number
    },
    date: {
        type: Date,
        default: dateLocal
    },
    work: {
        type: String
    },
    bodywork: {
        pens: { type: Boolean },
        radio: { type: Boolean },
        knobs: { type: Boolean },
        lighter: { type: Boolean },
        enrollment: { type: Boolean },
        antenna: { type: Boolean },
        hubcaps: { type: Boolean },
        tools: { type: Boolean },
        cat: { type: Boolean },
        mirrors: { type: Boolean },
        nuts: { type: Boolean },
        emergencyTire: { type: Boolean },
        gasoline: { type: Number },
        news: { type: String }
    },
    state: {
        type: Number,
        default: 1,
    }
});

workShopSchema.plugin(timeZone, { paths: ['date'] });

module.exports = mongoose.model('WorkShop', workShopSchema)