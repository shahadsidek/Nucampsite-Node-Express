const mongoose = require('mongoose');
const passportLocalMangoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // after adding passportLocalMangoose we dont need to have this as it will be handled by plm
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // password: {
    //     type: String,
    //     required: true
    // },
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    facebookId: String,
});

userSchema.plugin(passportLocalMangoose);// it will provided additional authentication methods.
// the module name is user and the collection is users -    and the schema to use defines at the top
module.exports = mongoose.model('User', userSchema);