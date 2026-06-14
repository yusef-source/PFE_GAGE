const pool = require("../config/db");

const getHeatmapPrixQuartiers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        quartier,
        COUNT(*) AS nombre_parcelles,

        ROUND(AVG(prix_app_final)::numeric, 2) AS prix_moyen_app,

        ROUND(AVG((pt_v_final + pc_v_final))::numeric, 2) AS prix_moyen_villa,

        ROUND(AVG((pt_zi_final + pc_zi_final))::numeric, 2) AS prix_moyen_zi,

        ST_AsGeoJSON(ST_Union(geom))::json AS geometry
      FROM parcellaire
      WHERE quartier IS NOT NULL
      GROUP BY quartier
    `);

    const geojson = {
      type: "FeatureCollection",
      features: result.rows.map((row) => ({
        type: "Feature",
        geometry: row.geometry,
        properties: {
          quartier: row.quartier,
          nombre_parcelles: Number(row.nombre_parcelles),
          prix_moyen_app: row.prix_moyen_app,
          prix_moyen_villa: row.prix_moyen_villa,
          prix_moyen_zi: row.prix_moyen_zi,
        },
      })),
    };

    res.json(geojson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur heatmap" });
  }
};

module.exports = { getHeatmapPrixQuartiers };