const mongoose = require('mongoose');
const uniqueValidater = require('mongoose-unique-validator');

let rols = {
    values: ['ROOT_ROL', 'ADMIN_ROL', 'CELLAR_ROL', 'SALES_ROL', 'DRINK_ROL', 'KITCHEN_ROL'],
    message: '{VALUE} no es un rol válido'
};


let Schema = mongoose.Schema;

let userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Email es requerido']
    },
    name: {
        type: String,
        required: [true, 'Nombre es requerido']
    },
    password: {
        type: String,
        required: [true, 'El password es requerido'],
    },
    branch: [{
        type: Schema.ObjectId,
        ref: 'Branch'
    }],
    role: {
        type: String,
        enum: rols,
        default: 'SALES_ROL'
    },
    state: {
        type: Boolean,
        default: true,
    },
    changePass: {
        type: Boolean,
        default: false,
    },
});

userSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
};


userSchema.plugin(uniqueValidater, {
    message: '{PATH} deber ser único'
});


module.exports = mongoose.model('User', userSchema);