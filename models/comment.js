const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const post= require('./post')

const commentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;