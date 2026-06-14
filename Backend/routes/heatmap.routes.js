const express = require("express");
const router = express.Router();

const { getHeatmapPrixQuartiers } = require("../controllers/heatmap.controller");

router.get("/prix-quartiers", getHeatmapPrixQuartiers);

module.exports = router;