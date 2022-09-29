const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let fileSchema = new Schema({
    filename: {
        type: String,
    },
    metadata: {
        type: String,
    },
    contentType: {
        type: String,
    },
    size: {
        type: Number,
    },
});

fileSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});


module.exports = mongoose.model('File', fileSchema);