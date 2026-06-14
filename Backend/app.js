const heatmapRoutes = require("./routes/heatmap.routes");
const zonesPrixRoutes = require("./routes/zonesPrix.routes");
const voirieRoutes = require("./routes/voirie.routes");
const transportRoutes = require("./routes/transport.routes");
const equipementsRoutes = require("./routes/equipements.routes");
const parcellesRoutes = require("./routes/parcelles.routes");
const filterOptionsRoutes = require("./routes/filterOptions.routes");

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend immobilier fonctionne");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Connexion PostgreSQL réussie",
      date: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur connexion PostgreSQL",
      error: error.message,
    });
  }
});

const PORT = 3001;

app.use(cors());

app.use("/api/parcelles", parcellesRoutes);
app.use("/api/equipements", equipementsRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/voirie", voirieRoutes);
app.use("/api/zones-prix", zonesPrixRoutes);
app.use("/api/heatmap", heatmapRoutes);
app.use("/api/filter-options", filterOptionsRoutes);

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});