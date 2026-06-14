const express = require("express");
const router = express.Router();

const { getVoirie } = require("../controllers/voirie.controller");

router.get("/", getVoirie);

module.exports = router;