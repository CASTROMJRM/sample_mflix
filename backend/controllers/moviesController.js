const mongoose = require("mongoose");
const Movie = require("../models/movieModel");

const MOVIE_LIST_SELECT =
  "title year rated runtime genres poster imdb num_mflix_comments";
const MOVIE_DETAIL_SELECT =
  "title year rated runtime genres fullplot poster directors cast imdb num_mflix_comments";

function normalizeStars(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.min(5, Math.max(0, Number((value / 2).toFixed(1))));
}

function buildRatingInfo(movie, commentsCount) {
  const imdbRating =
    movie?.imdb && typeof movie.imdb.rating === "number"
      ? movie.imdb.rating
      : null;

  return {
    hasComments: commentsCount > 0,
    commentsCount,
    imdbRating,
    stars: commentsCount > 0 ? normalizeStars(imdbRating) : null,
  };
}

async function getMovies(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const q = String(req.query.q || "").trim();

    const filter = q ? { title: { $regex: q, $options: "i" } } : {};
    const skip = (page - 1) * limit;

    const [total, movies] = await Promise.all([
      Movie.countDocuments(filter),
      Movie.find(filter)
        //.select("title year rated runtime genres poster")
        .select(MOVIE_LIST_SELECT)
        .sort({ year: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const moviesWithRating = movies.map((movie) => {
      const commentsCount = Number(movie.num_mflix_comments || 0);
      return {
        ...movie,
        ratingInfo: buildRatingInfo(movie, commentsCount),
      };
    });
    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      movies: moviesWithRating,
      //movies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: "Error al leer películas" });
  }
}

async function getMovieById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ ok: false, mensaje: "ID inválido o error" });
    }

    /*const movie = await Movie.findById(id)
      .select(MOVIE_DETAIL_SELECT)
      .lean();*/

    const movie = await Movie.findById(id).select(MOVIE_DETAIL_SELECT).lean();

    if (!movie) {
      return res.status(404).json({ ok: false, mensaje: "No existe" });
    }

    //return res.json(movie);

    const commentsCollection = mongoose.connection.db.collection("comments");
    const comments = await commentsCollection
      .find({ movie_id: new mongoose.Types.ObjectId(id) })
      .sort({ date: -1 })
      .limit(8)
      .project({ name: 1, email: 1, text: 1, date: 1 })
      .toArray();

    const commentsCount = Number(
      movie.num_mflix_comments || comments.length || 0,
    );

    return res.json({
      ...movie,
      comments,
      ratingInfo: buildRatingInfo(movie, commentsCount),
    });
    
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, mensaje: "Error al leer la película" });
  }
}

module.exports = {
  getMovies,
  getMovieById,
};
