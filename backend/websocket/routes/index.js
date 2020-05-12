const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send('OK').status(200);
});

module.exports = router;