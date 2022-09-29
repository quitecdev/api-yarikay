const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let productSchema = new Schema({
    cod: {
        type: String,
        unique: true,
        required: [true, 'Email es requerido']
    },
    mark: {
        type: Schema.ObjectId,
        ref: 'Mark'
    },
    pattern: {
        type: Schema.ObjectId,
        ref: 'Pattern'
    },
    category: {
        type: Schema.ObjectId,
        ref: 'Category'
    },
    composed: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        unique: true,
        required: [true, 'Nombre es requerido']
    },
    price: {
        purchase: { type: Number },
        sale: { type: Number },
        minimum: { type: Number },
        iva: { type: Boolean, default: true }
    },
    tags: [
        { type: String }
    ],
    description: {
        type: String,
    },
    detail: {
        type: String
    },
    images: [
        { type: String }
    ],

    state: {
        type: Boolean,
        default: true,
    }
});

productSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});

module.exports = mongoose.model('Product', productSchema);