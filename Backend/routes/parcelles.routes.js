const express = require("express");
const router = express.Router();

const {
  getParcelles,
  getParcelleById,
  getParcelleAtPoint,
} = require("../controllers/parcelles.controller");

/**
 * Récupérer toutes les parcelles en GeoJSON.
 * Conservé pour les anciens traitements, la table attributaire,
 * les outils existants ou un éventuel retour au mode GeoJSON.
 */
router.get("/", getParcelles);

/**
 * Récupérer la parcelle située sous un point cliqué sur la carte.
 * Utilisé avec la couche WMS Score AMC.
 *
 * Exemple :
 * /api/parcelles/at-point?lat=33.57&lng=-7.60
 *
 * Important :
 * Cette route doit être placée AVANT /:gid,
 * sinon Express peut interpréter "at-point" comme un gid.
 */
router.get("/at-point", getParcelleAtPoint);

/**
 * Récupérer une parcelle par son gid.
 */
router.get("/:gid", getParcelleById);

module.exports = router;