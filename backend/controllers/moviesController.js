const mongoose = require("mongoose");
const Movie = require("../models/movieModel");

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
        .select("title year rated runtime genres poster")
        .sort({ year: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      movies,
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

    const movie = await Movie.findById(id)
      .select("title year rated runtime genres fullplot poster directors cast")
      .lean();

    if (!movie) {
      return res.status(404).json({ ok: false, mensaje: "No existe" });
    }

    return res.json(movie);
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
