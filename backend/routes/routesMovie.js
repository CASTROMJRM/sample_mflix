const express = require("express");
const { getMovies, getMovieById } = require("../controllers/moviesController");

const router = express.Router();

router.get("/", getMovies);
router.get("/:id", getMovieById);

module.exports = router;
