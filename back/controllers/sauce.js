const Sauce = require("../models/sauce");
const fs = require("fs");
const sauce = require("../models/sauce");

// GET ALL
exports.getAllSauces = async (req, res, next) => {
  try {
    const allSauces = await Sauce.find({});
    res.status(200).json(allSauces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST ONE
exports.createSauce = async (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  // req.body.sauce is a string > turn it into json object
  req.body.sauce = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    name: req.body.sauce.name,
    manufacturer: req.body.sauce.manufacturer,
    description: req.body.sauce.description,
    mainPepper: req.body.sauce.mainPepper,
    imageUrl: url + "/images/" + req.file.filename,
    heat: req.body.sauce.heat,
    userId: req.body.sauce.userId,
  });
  try {
    const newSauce = await sauce.save();
    res.status(201).json(newSauce);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET ONE
exports.getOneSauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findById(req.params.id);
    res.status(200).json(sauce);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// MODIFY ONE
exports.modifySauce = async (req, res, next) => {
  // make sure user is owner of the sauce
  const sauceToModify = await Sauce.findOne({ _id: req.params.id });
  if (sauceToModify.userId === req.auth.userId) {
    let sauce = new Sauce({ _id: req.params._id });
    // if user upload new image
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      req.body.sauce = JSON.parse(req.body.sauce);
      // delete old image
      Sauce.findOne({ _id: req.params.id })
        .then((pickedSauce) => {
          const filename = pickedSauce.imageUrl.split("/images/")[1];
          fs.unlink("images/" + filename, (err) => {
            if (err) {
              console.log(err);
            }
          });
        })
        .catch((error) => {
          res.status(500).json({
            error: error,
          });
        });
      // update with new image
      sauce = {
        _id: req.params.id,
        name: req.body.sauce.name,
        manufacturer: req.body.sauce.manufacturer,
        description: req.body.sauce.description,
        mainPepper: req.body.sauce.mainPepper,
        imageUrl: url + "/images/" + req.file.filename,
        heat: req.body.sauce.heat,
        likes: req.body.sauce.likes,
        dislikes: req.body.sauce.dislikes,
        usersLiked: req.body.sauce.usersLiked,
        usersDisliked: req.body.sauce.usersDisliked,
        userId: req.body.sauce.userId,
      };
      // if no new image being uploaded
    } else {
      sauce = {
        _id: req.params.id,
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
        mainPepper: req.body.mainPepper,
        imageUrl: req.body.imageUrl,
        heat: req.body.heat,
        likes: req.body.likes,
        dislikes: req.body.dislikes,
        usersLiked: req.body.usersLiked,
        usersDisliked: req.body.usersDisliked,
        userId: req.body.userId,
      };
    }
    try {
      await Sauce.updateOne({ _id: req.params.id }, sauce);
      res.status(201).json({
        message: "Sauce updated successfully!",
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    req.status(401).json({ message: "Unauthorized user" });
  }
};

// DELETE ONE
exports.deleteSauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    // get name for database to find file
    // make sure user is owner of the sauce
    console.log(req.auth);
    if (sauce.userId === req.auth.userId) {
      const filename = sauce.imageUrl.split("/images/")[1];
      // delete file from folder and after from DB
      fs.unlink("images/" + filename, async () => {
        await Sauce.deleteOne({ _id: req.params.id });
        res.status(200).json({
          message: "Sauce Deleted!",
        });
      });
    } else {
      req.status(401).json({ message: "Unauthorized user" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// RATE ONE
exports.rateSauce = async (req, res, next) => {
  let rating = req.body.like;
  let chosenSauce = await Sauce.findOne({ _id: req.params.id });
  let userId = req.body.userId;
  console.log(rating);
  console.log(req.body);
  // user liked sauce
  if (rating === 1) {
    if (
      chosenSauce.usersLiked.includes(userId) ||
      chosenSauce.usersDisliked.includes(userId)
    ) {
      // forbid like more than once for the same user
      return res
        .status(400)
        .json({ message: "Already liked or disliked" });
    } else {
      try {
        await Sauce.updateOne(
          { _id: req.params.id },
          {
            $push: { usersLiked: req.body.userId },
            $inc: { likes: +1 },
          }
        );
        res.status(201).json({
          message: "User liked the sauce.",
        });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
  // user return like or dislike
  if (rating === 0) {
    try {
      if (chosenSauce.usersLiked.includes(userId)) {
        await Sauce.updateOne(
          { _id: req.params.id },
          {
            $pull: { usersLiked: req.body.userId },
            $inc: { likes: -1 },
          }
        );
        res.status(201).json({ message: "User removed like" });
      }
      if (chosenSauce.usersDisliked.includes(userId)) {
        await Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: req.body.userId },
          }
        );
        res.status(201).json({ message: "User removed dislike" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // user dislike the sauce
  if (rating === -1) {
    if (
      chosenSauce.usersLiked.includes(userId) ||
      chosenSauce.usersDisliked.includes(userId)
    ) {
      // forbid dislike more than once for the same user
      return res
        .status(400)
        .json({ message: "Already liked or disliked" });
    } else {
      try {
        await Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: +1 },
            $push: { usersDisliked: req.body.userId },
          }
        );
        res.status(201).json({ message: "User disliked the sauce." });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
};
