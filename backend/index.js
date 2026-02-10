const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const moviesRoutes = require("./routes/routesMovie");

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

app.get("/", (res) => {
  res.json({ ok: true, mensaje: "API funcionando" });
});

app.use("/api/movies", moviesRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("API corriendo en", PORT);
    });
  })
  .catch((error) => {
    console.error("No se pudo conectar a MongoDB:", error.message);
    process.exit(1);
  });
