const mongoose = require("mongoose");
const { boolean } = require("yup/lib/locale");

const { Schema, Types } = mongoose;

const TweetSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  createdOn: {
    type: Date,
  },
  likes: {
    type: [Types.ObjectId],
  },
  disLikes: {
    type: [Types.ObjectId],
  },
  sharedBy: [],
  retweet: {
    type: Types.ObjectId,
  },
  // threads:[threadSchema]
});

const Tweet = mongoose.model("Tweets", TweetSchema);
module.exports = Tweet;
