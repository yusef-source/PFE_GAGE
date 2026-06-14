const pool = require("../config/db");

const getEquipements = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        gid,
        nom,
        nature,
        statut,
        ST_AsGeoJSON(ST_MakeValid(ST_Transform(geom, 4326)))::json AS geometry
      FROM equipements
    `);

    const geojson = {
      type: "FeatureCollection",
      features: result.rows.map((row) => ({
        type: "Feature",
        geometry: row.geometry,
        properties: {
          gid: row.gid,
          nom: row.nom,
          nature: row.nature,
          statut: row.statut,
        },
      })),
    };

    res.json(geojson);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getEquipements };