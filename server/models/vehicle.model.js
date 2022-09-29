const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let vehicleSchema = new Schema({
    client: {
        type: String
    },
    licenceplate: {
        type: String
    },
    mark: {
        type: String
    },
    model: {
        type: String
    },
    year: {
        type: Number
    },
    color: {
        type: String
    },
    state: {
        type: Boolean,
        default: true,
    }
});


module.exports = mongoose.model('Vehicle', vehicleSchema);