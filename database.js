const mongoose = require("mongoose");
const url = `mongodb://localhost:${process.env.DATABASE_PORT}/twitter_backend`;
const db = mongoose.connect(url).then(() => {
  console.log(`Database connected on port ${process.env.DATABASE_PORT}`);
});

module.exports = db;
