const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// to give path to express for getting static images from folder
const path = require("path");

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

require("dotenv").config();

const app = express();

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_ID}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Successfully connected to Piiquante MongoDB Atlas!");
  })
  .catch((error) => {
    console.log("Unable to connect to Piiquante MongoDB Atlas!");
    console.error(error);
  });

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// need to use bodyParser() if you want the form data
// to be available in req.body.
app.use(bodyParser.json());

// actual direction for app and add name from folder
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

// ------------------
module.exports = app;
