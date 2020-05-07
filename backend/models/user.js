const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    name: {
        type: String,
        required: true,
        minlength: 1
    },
    picture: {
        type: String,
        default: 'https://res.cloudinary.com/erizky/image/upload/v1588574095/profile_s89x7z.png'
    },
    communities: {
        type: Array
    }
},
{
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;