const pool = require("../config/db");

const makeGeoJSON = (rows) => ({
  type: "FeatureCollection",
  features: rows.map((row) => {
    const { geometry, ...properties } = row;

    return {
      type: "Feature",
      geometry,
      properties,
    };
  }),
});

const getTram = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        gid,
        ligne,
        "length",
        ST_AsGeoJSON(
          ST_MakeValid(
            CASE
              WHEN ST_SRID(geom) = 4326 THEN geom
              WHEN ST_SRID(geom) = 0 THEN ST_SetSRID(geom, 4326)
              ELSE ST_Transform(geom, 4326)
            END
          )
        )::json AS geometry
      FROM tram
      WHERE geom IS NOT NULL
    `);

    res.json(makeGeoJSON(result.rows));
  } catch (error) {
    console.error("Erreur serveur tram :", error);
    res.status(500).json({ message: "Erreur serveur tram" });
  }
};


const getStationsTram = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        gid,
        objectid,
        id,
        nature,
        ligne,
        nom,
        ST_AsGeoJSON(
          ST_MakeValid(
            CASE
              WHEN ST_SRID(geom) = 4326 THEN geom
              WHEN ST_SRID(geom) = 0 THEN ST_SetSRID(geom, 4326)
              ELSE ST_Transform(geom, 4326)
            END
          )
        )::json AS geometry
      FROM stations_tram
      WHERE geom IS NOT NULL
    `);

    res.json(makeGeoJSON(result.rows));
  } catch (error) {
    console.error("Erreur serveur stations tram :", error);
    res.status(500).json({ message: "Erreur serveur stations tram" });
  }
};


const getBus = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        gid,
        stopname,
        directioni,
        routeid,
        lignename,
        routecolor,
          ST_AsGeoJSON(ST_MakeValid(ST_Transform(geom, 4326)))::json AS geometry
      FROM stopbus
    `);

    res.json(makeGeoJSON(result.rows));
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur bus" });
  }
};

const getGare = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        gid,
        name,
          ST_AsGeoJSON(ST_MakeValid(ST_Transform(geom, 4326)))::json AS geometry
      FROM gare
    `);

    res.json(makeGeoJSON(result.rows));
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur gare" });
  }
};

module.exports = {
  getTram,
  getBus,
  getGare,
  getStationsTram,
};