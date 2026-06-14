const express = require("express");
const router = express.Router();

const { getZonesPrix } = require("../controllers/zonesPrix.controller");

router.get("/", getZonesPrix);

module.exports = router;