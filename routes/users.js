var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

/* GET users listing. */

// //users home -- all tweets of users will be visible -- extra
// router.get("/", auth, async (req, res) => {});

//to get all users followed by logged in user
router.get("/following", auth, async (req, res) => {
  try {
    let username = req.user.username;
    console.log(username);
    if (req.user.followingUsers.length == 0) {
      res.json({ message: `${username} don't follow anyone` });
    } else {
      let allUsers = await User.find(
        { _id: req.user.followingUsers },
        {
          username: 1,
        }
      );
      res.json(JSON.parse(JSON.stringify(allUsers)));
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

//addfollower
router.post("/follow", auth, async (req, res) => {
  try {
    const usernameToFollow = req.body.username;
    const username = req.user.username;
    const userToFollow = await User.findOne({ username: usernameToFollow });
    if (!userToFollow) {
      res.json({
        message: `no user exists from username ${usernameToFollow}`,
      });
    } else {
      const alreadyFollowing = await User.find({
        followingUsers: userToFollow._id,
      });
      if (alreadyFollowing.length == 0) {
        req.user.followingUsers.push(userToFollow._id);
        await req.user.save();
        res.json({
          message: `${username} started following ${usernameToFollow}`,
        });
      } else {
        res.json({
          message: `${username} already following ${usernameToFollow}`,
        });
      }
    }
  } catch (err) {
    res.json({ error: err.message });
  }
});

router.post("/unfollow", auth, async (req, res) => {
  try {
    const usernameToUnfollow = req.body.username;
    const username = req.user.username;
    const userToUnfollow = await User.findOne({ username: usernameToUnfollow });
    if (!userToUnfollow) {
      res.json({
        message: `no user exists from username ${usernameToUnfollow}`,
      });
    } else {
      req.user.followingUsers.pull(userToUnfollow._id);
      await req.user.save();
      res.json({ message: `${username} unfollowed ${usernameToUnfollow}` });
    }
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
