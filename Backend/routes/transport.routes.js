const express = require("express");
const router = express.Router();

const {
  getTram,
  getBus,
  getGare,
  getStationsTram,
} = require("../controllers/transport.controller");

router.get("/tram", getTram);
router.get("/bus", getBus);
router.get("/gare", getGare);
router.get("/stations-tram", getStationsTram);

module.exports = router;