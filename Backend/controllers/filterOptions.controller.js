const pool = require("../config/db");

const getFilterOptions = async (req, res) => {
  try {
    const quartiers = await pool.query(`
      SELECT DISTINCT quartier
      FROM parcellaire
      WHERE quartier IS NOT NULL
      ORDER BY quartier
    `);

    const zonages = await pool.query(`
      SELECT DISTINCT secteur
      FROM parcellaire
      WHERE secteur IS NOT NULL
      ORDER BY secteur
    `);

    const hauteurs = await pool.query(`
      SELECT DISTINCT hauteur_mx
      FROM parcellaire
      WHERE hauteur_mx IS NOT NULL
      ORDER BY hauteur_mx
    `);

    const natures = await pool.query(`
      SELECT DISTINCT nature
      FROM parcellaire
      WHERE nature IS NOT NULL
      ORDER BY nature
    `);

    res.json({
      quartiers: quartiers.rows.map((r) => r.quartier),
      zonages: zonages.rows.map((r) => r.secteur),
      hauteurs: hauteurs.rows.map((r) => r.hauteur_mx),
      natures: natures.rows.map((r) => r.nature),
    });
  } catch (error) {
    console.error("Erreur getFilterOptions:", error);
    res.status(500).json({ error: "Erreur serveur options filtres" });
  }
};

module.exports = {
  getFilterOptions,
};