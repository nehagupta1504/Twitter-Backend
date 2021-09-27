const express = require("express");
const yup = require("yup");
require("yup-password")(yup);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 14;

const User = require("../models/userModel");

const router = express.Router();

let userSchema = yup.object().shape({
  name: yup.string().required(),
  username: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required().password().min(8).max(20),
  createdOn: yup.date().default(function () {
    return new Date();
  }),
});
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/signup", async (req, res) => {
  try {
    const isValidated = userSchema.validateSync(req.body);
    const passwordHash = bcrypt.hashSync(req.body.password, saltRounds);
    const newuser = new User({ ...isValidated, password: passwordHash });
    const result = await newuser.save();
    res.status = 200;
    res.json({ message: "User sign up successful" });
  } catch (err) {
    if (err["code"] == "11000") {
      if (err["keyValue"]) {
        switch (Object.keys(err["keyValue"])[0]) {
          case "username":
            res.json({ message: "Username already exists" });
            break;
          case "email":
            res.json({ message: "User already exists" });
            break;
          default:
            res.json({ message: err.message });
        }
      }
    } else {
      res.json({ message: err.message });
    }
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.json({ message: `Username ${username} doesn't exists` });
    } else {
      const pwdVerified = await bcrypt.compare(password, user.password);
      if (!pwdVerified) {
        res.json({ message: "Please enter correct password" });
      } else {
        const token = await jwt.sign(
          { username: user.username },
          process.env.JWT_SECRET
        );
        res.json({ username: user.username, token: token });
      }
    }
  } catch (err) {
    res.json({ message: err.message });
  }
});
module.exports = router;
