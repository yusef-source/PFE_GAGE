const pool = require("../config/db");

const getZonesPrix = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        gid,
        id,
        quartier,
        prix_app,
        pt_v,
        pc_v,
        pt_zi,
        pc_zi,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM zonageprix
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
    res.status(500).json({ message: "Erreur serveur zones-prix" });
  }
};

module.exports = { getZonesPrix };