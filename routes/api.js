const express = require('express');
const router = express.Router();
const connection = require('../connect');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Models
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

var auth = require('../services/authentication');


router.post('/authenticate',(req,res)=>{
    let user=req.body;
    User.findOne({email:user.email},(err,result)=>{
        if(!err){
            if(result){
                if(result.password===user.password){
                    const response={email:result.email,username:result.useername};
                    const token=jwt.sign(response,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'8h'});
                    return res.status(200).json({token:token});
                }
                else if(result.password!==user.password){
                    return res.status(400).json({
                        message:"Incorrect password"
                    });
                }
            }
            else{
                return res.status(400).json({
                    message:"User not found"
                });
            }
        }
        else{
            return res.status(500).json(err);
        }
    });
});

router.get('/user', auth.authenticateToken, (req, res) => {

    User.findOne({ username: req.username }, (err, user) => {
        if (err) return res.status(500).send(err);
        if (!user) return res.status(404).send('User not found');

        // Return the user's name, number of followers, and number of followings
        return res.send({
            username: user.username,
            followers: user.followers.length,
            followings: user.followings.length
        });
    });
});

router.get('/posts/{id}', auth.authenticateToken,(req,res) => {
    Post.findById(req.params.id)
    .populate('comments')
    .populate('likes')
    .then((post) => {
        res.json(post)
    })
    .catch((err) => {
        res.status(404).json({nopostfound: 'No post found with that ID'});
    });
});

router.get('/all_posts', auth.authenticateToken, (req, res) => {
    Post.find()
    .populate('comments')
    .populate('likes')
    .sort({created_at: -1})
    .then((posts) => {
        res.json(posts)
    })
    .catch((err) => {
        res.status(404).json({nopostfound: 'No posts found'});
    });
});


router.post('/follow/{id}', auth.authenticateToken, (req, res) => {
    const userToFollow = req.params.id;
    User.findById(req.user.id)
    .then((user) => {
        if (user.following.includes(userToFollow)) {
            return res.status(400).json({alreadyfollowing: 'You are already following this user'});
        }
        user.following.push(userToFollow);
        user.save().then((user) => res.status(200).json(user));
    })
    .catch((err) => {
        res.status(404).json({nouserfound: 'No user found with that ID'});
    })
});

router.post('/unfollow/{id}', auth.authenticateToken, (req, res) => {
    const userToUnfollow = req.params.id;
    User.findById(req.user.id)
    .then((user) => {
        if (!user.following.includes(userToUnfollow)) {
            return res.status(400).json({notfollowing: 'You are not following this user'});
        }
        user.following.pull(userToUnfollow);
        user.save().then((user) => res.status(200).json(user));
    })
    .catch((err) => {
        res.status(404).json({nouserfound: 'No user found with that ID'});
    })
});

router.post('/like/{id}', auth.authenticateToken, (req, res) => {
    const postToLike = req.params.id;
    Post.findById(postToLike)
    .then((post) => {
        if (post.likes.includes(req.user.id)) {
            return res.status(400).json({alreadyliked: 'You have already liked this post'});
        }
        post.likes.push(req.user.id);
        post.save().then((post) => res.status(200).json(post));
    })
    .catch((err) => {
        res.status(404).json({nopostfound: 'No post found with that ID'});
    }
)});

router.post('/unlike/{id}', auth.authenticateToken, (req, res) => {
    const postToUnlike = req.params.id;
    Post.findById(postToUnlike)
    .then((post) => {
        if (!post.likes.includes(req.user.id)) {
            return res.status(400).json({notliked: 'You have not liked this post'});
        }
        post.likes.pull(req.user.id);
        post.save().then((post) => res.status(200).json("post unliked"));
    }
)});


router.post('/comment/{id}', auth.authenticateToken, (req, res) => {
    const content = req.body.content;
    const postToComment = req.params.id;
    Post.findById(postToComment)
    .then((post) => {
        const newComment = new Comment({
            author: req.user.id,
            comment: content.comment,
        });
        post.comments.push(newComment);
        post.save()
            .then((post) => res.status(200).json(newComment._id))
            .catch((err) => res.status(400).json(err));

    })
    .catch((err) => {
        res.status(404).json({nopostfound: 'No post found with that ID'});
    }
)});

module.exports = router;


    


