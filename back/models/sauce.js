const mongoose = require("mongoose");

const sauceSchema = mongoose.Schema({
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  // an array of userId's ⤵ as string
  usersLiked: [{ type: String, default: 0 }], //add default
  usersDisliked: [{ type: String, default: 0 }],
  userId: { type: String, required: true },
  // usersLiked: {type: [String]},
  // usersDisliked: {type: [String]},
});

module.exports = mongoose.model("Sauce", sauceSchema);
