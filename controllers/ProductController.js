const express = require("express");
const router = express.Router();

const products = require('../commonFunctions/product.json')
const {
  success,
  error,
  requiredParams,
  conflict,
  invalidEmail,
  internalError,
  notFound
} = require("../commonFunctions/response")

router.get("/", (req, res) => {
  const { search} = req.query;
  let filtered = [...products];

  if (search) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }
   const response = success("product list",filtered)
   return res.json(response);
});

module.exports = router;
