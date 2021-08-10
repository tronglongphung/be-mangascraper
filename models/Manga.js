const { Schema, model } = require("mongoose");

const mangaSchema = new Schema({
  name: {
    type: String,
  },
  coverImg: {
    type: String,
  },
  url: {
    type: String,
  },
  status: {
    type: String,
  },
  description: {
    type: String,
  },
  updated: {
    type: String,
  },
  rating: {
    ratingFromFive: String,
    votes: Number,
  },
  alternative: [
    {
      type: String,
    },
  ],
  genres: [
    {
      type: String,
    },
  ],
  authors: [
    {
      type: String,
    },
  ],
  chapters: [
    {
      chapter: String,
      views: Number,
      upload_date: String,
      url: String,
    },
  ],
});

const Manga = model("Manga", mangaSchema);

module.exports = Manga;
