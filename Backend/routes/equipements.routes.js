const express = require("express");
const router = express.Router();

const { getEquipements } = require("../controllers/equipements.controller");

router.get("/", getEquipements);

module.exports = router;