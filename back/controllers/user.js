const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const USER_TOKEN = process.env.USER_TOKEN;
// security improvements
const validator = require("email-validator");
const passwordValidator = require("password-validator");

exports.signup = async (req, res, next) => {
  try {
    // email validation
    const emailValid = await validator.validate(req.body.email);
    if (emailValid === false) {
      return res.status(400).json({
        message: "Email is not valid. Please try again",
      });
    }
    // password validation
    const schema = new passwordValidator();
    schema
      .is()
      .min(10)
      .is()
      .max(100)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits(2)
      .has()
      .not()
      .spaces();
    const validPassword = await schema.validate(req.body.password, {
      detail: true, // reasons of failed pw validation
    });
    if (validPassword === false) {
      return res.status(400).json({
        message: "Password is not valid. Please try again",
      });
    }
    // password hashing with salt
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });
    // if all validations passed - add user
    await user.save();
    res.status(201).json({
      message: "User added successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
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
