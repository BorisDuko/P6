const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const USER_TOKEN = process.env.USER_TOKEN;

exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then(() => {
        res.status(201).json({
          message: "User added successfully!",
        });
      })
      .catch((error) => {
        res.status(500).json({
          error: error,
        });
      });
  });
};

exports.login = (req, res, next) => {
  // check if user exists by looking for the user with the same email
  User.findOne({ email: req.body.email })
    .then((user) => {
      // if can't find - return error with status: saying user not found
      if (!user) {
        return res.status(401).json({
          error: new Error("User not found"),
        });
      }
      // if user exists
      // compare entered password with the hash that stored in database
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // if it's not valid send error message
          if (!valid) {
            return res.status(401).json({
              error: new Error("Incorrect password"),
            });
          }
          // if it is valid
          // create new token constant
          const token = jwt.sign({ userId: user._id }, USER_TOKEN, {
            expiresIn: "24h",
          });
          // send back the userId and token
          res.status(200).json({
            userId: user._id,
            token: token,
          });
        })
        .catch((error) => {
          res.status(500).json({
            error: error,
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
};
