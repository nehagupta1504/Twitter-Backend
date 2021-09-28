const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdOn: {
    type: Date,
  },
  followingUsers: [Types.ObjectId],
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
