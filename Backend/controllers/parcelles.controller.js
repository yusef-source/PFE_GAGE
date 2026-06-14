const pool = require("../config/db");

const getParcelles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        gid,
        tf,
        nature,
        surface,
        secteur,
        zonage,
        hauteur_mx,
        quartier,
        commune_ar,
        facade,
        cos,
        cus,

        -- Prix moyens de référence ANCFCC / zonageprix
        prix_app,
        pt_v,
        pc_v,
        pt_zi,
        pc_zi,

        -- Prix finaux ajustés AMC
        prix_app_final,
        pt_v_final,
        pc_v_final,
        pt_zi_final,
        pc_zi_final,

        score_final_amc,
        coef_amc,
        ST_AsGeoJSON(ST_MakeValid(ST_Transform(geom, 4326)))::json AS geometry
      FROM parcelles
    `);

    const geojson = {
      type: "FeatureCollection",
      features: result.rows.map((row) => ({
        type: "Feature",
        geometry: row.geometry,
        properties: {
          gid: row.gid,
          tf: row.tf,
          nature: row.nature,
          surface: row.surface,
          secteur: row.secteur,
          zonage: row.zonage,
          hauteur_mx: row.hauteur_mx,
          quartier: row.quartier,
          commune_ar: row.commune_ar,
          facade: row.facade,
          cos: row.cos,
          cus: row.cus,

          // Prix moyens de référence
          prix_app: row.prix_app,
          pt_v: row.pt_v,
          pc_v: row.pc_v,
          pt_zi: row.pt_zi,
          pc_zi: row.pc_zi,

          // Prix finaux AMC
          prix_app_final: row.prix_app_final,
          pt_v_final: row.pt_v_final,
          pc_v_final: row.pc_v_final,
          pt_zi_final: row.pt_zi_final,
          pc_zi_final: row.pc_zi_final,

          score_final_amc: row.score_final_amc,
          coef_amc: row.coef_amc,
        },
      })),
    };

    res.json(geojson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getParcelleById = async (req, res) => {
  try {
    const { gid } = req.params;

    const result = await pool.query(
      `
      SELECT
        gid,
        tf,
        nature,
        surface,
        secteur,
        zonage,
        hauteur_mx,
        quartier,
        commune_ar,
        facade,
        cos,
        cus,

        -- Prix moyens de référence ANCFCC / zonageprix
        prix_app,
        pt_v,
        pc_v,
        pt_zi,
        pc_zi,

        -- Prix finaux ajustés AMC
        prix_app_final,
        pt_v_final,
        pc_v_final,
        pt_zi_final,
        pc_zi_final,

        score_final_amc,
        coef_amc,
        ST_AsGeoJSON(ST_MakeValid(ST_Transform(geom, 4326)))::json AS geometry
      FROM parcelles
      WHERE gid = $1
      `,
      [gid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Parcelle introuvable",
      });
    }

    const row = result.rows[0];

    res.json({
      type: "Feature",
      geometry: row.geometry,
      properties: {
        gid: row.gid,
        tf: row.tf,
        nature: row.nature,
        surface: row.surface,
        secteur: row.secteur,
        zonage: row.zonage,
        hauteur_mx: row.hauteur_mx,
        quartier: row.quartier,
        commune_ar: row.commune_ar,
        facade: row.facade,
        cos: row.cos,
        cus: row.cus,

        // Prix moyens de référence
        prix_app: row.prix_app,
        pt_v: row.pt_v,
        pc_v: row.pc_v,
        pt_zi: row.pt_zi,
        pc_zi: row.pc_zi,

        // Prix finaux AMC
        prix_app_final: row.prix_app_final,
        pt_v_final: row.pt_v_final,
        pc_v_final: row.pc_v_final,
        pt_zi_final: row.pt_zi_final,
        pc_zi_final: row.pc_zi_final,

        score_final_amc: row.score_final_amc,
        coef_amc: row.coef_amc,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getParcelles,
  getParcelleById,
};