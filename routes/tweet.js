var express = require("express");
const Tweet = require("../models/tweetModel");
var router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const yup = require("yup");
//validation
let tweetSchema = yup.object().shape({
  content: yup.string().required(),
  createdOn: yup.date().default(function () {
    return new Date();
  }),
});

//get all tweets of logges in user
router.get("/readall", auth, async (req, res) => {
  try {
    const allTweets = await Tweet.find({ userId: req.user._id });
    res.json(allTweets);
  } catch (err) {
    res.json({ error: err.message });
  }
});

//read tweet by its id
router.get("/read/:postId", auth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const postExists = await Tweet.findOne({ _id: postId });
    if (!postExists) {
      res.json({ message: `tweet with id ${postId} doesn't exists` });
    } else {
      res.status = 200;
      res.json(JSON.parse(JSON.stringify(postExists)));
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

//creating tweet
router.post("/add", auth, async (req, res) => {
  try {
    //validating
    let tweet = tweetSchema.validateSync(req.body);
    console.log(tweet);
    let tweetObj = {
      ...tweet,
      userId: req.user._id,
      username: req.user.username,
    };
    const newTweet = new Tweet({ ...tweetObj });
    await newTweet.save();
    res.status = 200;
    res.json({ message: "tweet created successfully", id: newTweet._id });
  } catch (err) {
    res.json({ error: err.message });
  }
});

//delete tweet
router.delete("/delete/:postId", auth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const postExists = await Tweet.findOne({ _id: postId });
    if (!postExists) {
      res.json({ message: `tweet with id ${postId} doesn't exists` });
    } else {
      const post = await Tweet.findByIdAndRemove({ _id: postId });
      res.status = 200;
      res.json({ message: `tweet deleted successfully`, tweet: post });
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

//likes and dislikes functionality
//like tweet
router.get("/like/:tweetId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const tweetId = req.params.tweetId;
    const tweet = await Tweet.findById({ _id: tweetId });
    tweet.likes.push(userId);
    await tweet.save();
    res.json({ message: `liked successful` });
  } catch (err) {
    res.json({ error: err.message });
  }
});
//remove like
router.get("/removelike/:tweetId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const tweetId = req.params.tweetId;
    const tweet = await Tweet.findById({ _id: tweetId });
    tweet.likes.pull({ _id: userId });
    await tweet.save();
    res.json({ message: "removed like" });
  } catch (err) {
    res.json({ error: err.message });
  }
});
//dislike tweet
router.get("/dislike/:tweetId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const tweetId = req.params.tweetId;
    const tweet = await Tweet.findById({ _id: tweetId });
    tweet.disLikes.push(userId);
    await tweet.save();
    console.log(tweet);
    res.json({ message: `dsliked successful` });
  } catch (err) {
    res.json({ error: err.message });
  }
});
//remove dislike
router.get("/removedislike/:tweetId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const tweetId = req.params.tweetId;
    const tweet = await Tweet.findById({ _id: tweetId });
    tweet.disLikes.pull({ _id: userId });
    await tweet.save();
    res.json({ message: "removed dislike" });
  } catch (err) {
    res.json({ error: err.message });
  }
});
async function auth(req, res, next) {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      res.sendStatus(403); //forbidden
    } else {
      const payLoad = jwt.verify(token, process.env.JWT_SECRET);
      const username = payLoad.username;
      const loggedInUser = await User.findOne({ username: username });
      req.user = loggedInUser;
      console.log(req.user, "calling next"); //to be removed
      next();
    }
  } catch (err) {
    res.json({ error: err.message });
  }
}

module.exports = router;
