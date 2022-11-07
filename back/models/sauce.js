const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, required: false }, // false?? / true
  dislikes: { type: Number, required: false }, // false?
  // question about: usersLiked: [ “String <userId>” ]
  usersLiked: { type: String }, // required?
  usersDisliked: { type: String }, // required?
});

module.exports = mongoose.model("Sauce", sauceSchema);
