const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "sample_mflix";

if (!MONGO_URI) {
  console.error("Falta MONGO_URI en el archivo .env");
  process.exit(1);
}

const client = new MongoClient(MONGO_URI);
let moviesCol;

async function conectarDB() {
  await client.connect();
  const db = client.db(DB_NAME);
  moviesCol = db.collection("movies");
  console.log("Conectado a MongoDB. BD:", DB_NAME);
}

app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API funcionando" });
});

app.get("/api/movies", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const q = String(req.query.q || "").trim();

    const filtro = q ? { title: { $regex: q, $options: "i" } } : {};
    const skip = (page - 1) * limit;

    const [total, movies] = await Promise.all([
      moviesCol.countDocuments(filtro),
      moviesCol
        .find(filtro, {
          projection: {
            title: 1,
            year: 1,
            rated: 1,
            runtime: 1,
            genres: 1,
            poster: 1,
          },
        })
        .sort({ year: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      movies,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: "Error al leer películas" });
  }
});

app.get("/api/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const movie = await moviesCol.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          title: 1,
          year: 1,
          rated: 1,
          runtime: 1,
          genres: 1,
          fullplot: 1,
          poster: 1,
          directors: 1,
          cast: 1,
        },
      },
    );

    if (!movie)
      return res.status(404).json({ ok: false, mensaje: "No existe" });
    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(400).json({ ok: false, mensaje: "ID inválido o error" });
  }
});

conectarDB()
  .then(() => {
    app.listen(PORT, () => console.log("API corriendo en", PORT));
  })
  .catch((e) => {
    console.error("No se pudo conectar a MongoDB:", e);
    process.exit(1);
  });
