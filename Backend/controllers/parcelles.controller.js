const pool = require("../config/db");

/**
 * Récupération de toutes les parcelles en GeoJSON.
 * 
 * Cette fonction est conservée pour l’ancien affichage GeoJSON,
 * la table attributaire, les traitements existants ou un éventuel retour
 * vers l’ancien mode d’affichage.
 */
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
    console.error("Erreur getParcelles:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Récupération d’une parcelle par son gid.
 * 
 * Cette fonction est conservée pour les usages existants :
 * recherche, zoom, table attributaire ou consultation détaillée.
 */
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
    console.error("Erreur getParcelleById:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Nouvelle fonction utilisée avec la couche WMS.
 *
 * Le WMS sert uniquement à l’affichage rapide des parcelles.
 * Lorsqu’un utilisateur clique sur la carte, cette fonction récupère
 * la parcelle située sous le point cliqué depuis PostGIS.
 *
 * En cas de superposition de plusieurs parcelles, la plus petite parcelle
 * est retournée afin de correspondre à la parcelle visible au-dessus
 * dans l’ordre d’affichage WMS.
 */
const getParcelleAtPoint = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Coordonnées manquantes",
      });
    }

    const result = await pool.query(
      `
      WITH clicked_point AS (
        SELECT ST_Transform(
          ST_SetSRID(ST_Point($1, $2), 4326),
          26191
        ) AS geom_point
      ),
      clicked_parcelle AS (
        SELECT
          p.gid,
          p.tf,
          p.nature,
          p.surface,
          p.secteur,
          p.zonage,
          p.hauteur_mx,
          p.quartier,
          p.commune_ar,
          p.facade,
          p.cos,
          p.cus,

          -- Prix moyens de référence ANCFCC / zonageprix
          p.prix_app,
          p.pt_v,
          p.pc_v,
          p.pt_zi,
          p.pc_zi,

          -- Prix finaux ajustés AMC
          p.prix_app_final,
          p.pt_v_final,
          p.pc_v_final,
          p.pt_zi_final,
          p.pc_zi_final,

          p.score_final_amc,
          p.coef_amc,
          p.geom
        FROM parcelles p, clicked_point cp
        WHERE ST_Covers(ST_MakeValid(p.geom), cp.geom_point)
        ORDER BY ST_Area(ST_MakeValid(p.geom)) ASC
        LIMIT 1
      )
      SELECT json_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(ST_MakeValid(ST_Transform(geom, 4326)))::json,
        'properties', json_build_object(
          'gid', gid,
          'tf', tf,
          'nature', nature,
          'surface', surface,
          'secteur', secteur,
          'zonage', zonage,
          'hauteur_mx', hauteur_mx,
          'quartier', quartier,
          'commune_ar', commune_ar,
          'facade', facade,
          'cos', cos,
          'cus', cus,

          'prix_app', prix_app,
          'pt_v', pt_v,
          'pc_v', pc_v,
          'pt_zi', pt_zi,
          'pc_zi', pc_zi,

          'prix_app_final', prix_app_final,
          'pt_v_final', pt_v_final,
          'pc_v_final', pc_v_final,
          'pt_zi_final', pt_zi_final,
          'pc_zi_final', pc_zi_final,

          'score_final_amc', score_final_amc,
          'coef_amc', coef_amc
        )
      ) AS feature
      FROM clicked_parcelle;
      `,
      [lng, lat]
    );

    if (result.rows.length === 0 || !result.rows[0].feature) {
      return res.json(null);
    }

    res.json(result.rows[0].feature);
  } catch (error) {
    console.error("Erreur getParcelleAtPoint:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération de la parcelle cliquée",
    });
  }
};

module.exports = {
  getParcelles,
  getParcelleById,
  getParcelleAtPoint,
};