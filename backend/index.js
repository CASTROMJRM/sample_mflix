const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const moviesRoutes = require("./routes/moviesRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API funcionando" });
});

app.use("/api/movies", moviesRoutes);

connectDB()
  .then(() => {
    pp.listen(PORT, () => {
      console.log("API corriendo en", PORT);
    });
  })
  .catch((error) => {
    console.error("No se pudo conectar a MongoDB:", error.message);
    process.exit(1);
  });
