const express = require("express");
const router = express.Router();

const {
  getFilterOptions,
} = require("../controllers/filterOptions.controller");

router.get("/", getFilterOptions);

module.exports = router;