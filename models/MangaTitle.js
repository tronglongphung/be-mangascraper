const mongoose = require("mongoose");

const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const mangaTitleSchema = new Schema({
  name: {
    type: String,
  },
  url: {
    type: String,
  },
});

const MangaTitle = mongoose.model("MangaTitle", mangaTitleSchema);

module.exports = MangaTitle;
