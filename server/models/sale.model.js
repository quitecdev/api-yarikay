const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let state = {
    values: [0, 1, 2, 3, 4],
    message: '{VALUE} no es un estado válido'
}

let Schema = mongoose.Schema;

let saleSchema = new Schema({
    branch: {
        type: Schema.ObjectId,
        ref: 'Branch'
    },
    documentType: {
        type: Schema.ObjectId,
        ref: 'DocumentType'
    },
    accessCode: {
        type: String,
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
        default: new Date()
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
        sale: {
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
    payment: {
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
        bank: {
            type: String,
            default: ''
        },
        brand: {
            type: String,
            default: ''
        },
        baucher: {
            type: String,
            default: ''
        },
        account: {
            type: String,
            default: ''
        },
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
    fee: {
        state: {
            type: Number,
            default: 1,
        },
        records: [{
            date: {
                type: Date,
            },
            mount: {
                type: Number,
            },
            payment: {

                method: {
                    type: Number
                },
                bank: {
                    type: String,
                    default: ''
                },
                number: {
                    type: String,
                    default: ''
                },
                state: {
                    type: Boolean,
                    default: false
                }
            }
        }]
    },
    images: [String],
    state: {
        type: Boolean,
        default: true,
    },
    observations: {
        type: String
    }
});

saleSchema
    .plugin(uniqueValidater, { message: '{PATH} deber ser único' });

module.exports = mongoose.model('Sale', saleSchema);