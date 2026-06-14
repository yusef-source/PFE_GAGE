const express = require("express");
const router = express.Router();

const {
  getParcelles,
  getParcelleById,
} = require("../controllers/parcelles.controller");

router.get("/", getParcelles);
router.get("/:gid", getParcelleById);

module.exports = router;