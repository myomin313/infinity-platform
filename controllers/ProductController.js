const express = require("express");
const router = express.Router();

const products = require('../commonFunctions/product.json')

router.get("/", (req, res) => {
  const { search} = req.query;
  let filtered = [...products];

  if (search) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  res.json({
    status: "success",
    data: filtered
  });
});

module.exports = router;
