const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const postSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;