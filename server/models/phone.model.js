const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let phoneSchema = new Schema({
    mark: {
        type: String
    },
    pattern: {
        type: String
    },
    name: {
        type: String
    },
    initialPrice: {
        type: Number,
        default : 0
    },
    salePrice: {
        type: Number,
        default : 0
    }
});

phoneSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('Phone', phoneSchema);