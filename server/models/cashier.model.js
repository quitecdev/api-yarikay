const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let cashierSchema = new Schema({
    branch: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    date: {
        type: Date,
        default: () => { return new Date() }
    },
    opening: {
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
    },
    closing: {
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
    },
    production: {
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
    },
    observation: {
        type: String,
        default: '',
    },
    state: {
        type: Boolean,
        default: true,
    }
});

cashierSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('Cashier', cashierSchema);