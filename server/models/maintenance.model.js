const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

const moment = require('moment-timezone');
const dateLocal = moment.tz(Date.now(), "America/Guayaquil");
const timeZone = require('mongoose-timezone');

let Schema = mongoose.Schema;

let maintenanceSchema = new Schema({
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
    detail: {
        brand: {
            type: String,
        },
        model: {
            type: String,
        },
        year: {
            type: String,
        },
        motor: {
            type: String,
        },
        chassis: {
            type: String,
        },
    },
    description: {
        type: String,
    },
    state: {
        type: Boolean,
        default: true,
    }
});

maintenanceSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
}).plugin(timeZone, { paths: ['date'] });

module.exports = mongoose.model('Maintenance', maintenanceSchema);