const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: String,
    year: Number,
    rated: String,
    runtime: Number,
    genres: [String],
    poster: String,
    fullplot: String,
    directors: [String],
    cast: [String],
  },
  {
    collection: "movies",
    strict: false,
  },
);

module.exports = mongoose.model("Movie", movieSchema);
