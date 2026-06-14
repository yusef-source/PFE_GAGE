const pool = require("../config/db");

const getVoirie = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        gid,
        highway,
        name,
        name_fr,
        name_ar,
        ref,
        oneway,
        lanes,
        maxspeed,
        surface,
        width,
        shape_leng,
        ST_AsGeoJSON(ST_MakeValid(ST_Transform(geom, 4326)))::json AS geometry
      FROM voirie
    `);

    const geojson = {
      type: "FeatureCollection",
      features: result.rows.map((row) => {
        const { geometry, ...properties } = row;

        return {
          type: "Feature",
          geometry,
          properties,
        };
      }),
    };

    res.json(geojson);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur voirie" });
  }
};

module.exports = { getVoirie };