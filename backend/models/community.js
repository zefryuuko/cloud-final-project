const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const communitySchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 1
    },
    description: {
        type: String
    },
    picture: {
        type: String,
        default: 'https://res.cloudinary.com/erizky/image/upload/v1588573978/community_mgshrs.png'
    },
    chat: {
        type: Array
    }
},
{
    timestamps: true,
});

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;