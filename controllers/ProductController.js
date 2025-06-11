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
/**
 * @swagger
 * /product/:
 *   get:
 *     summary: Get a list of products with optional search
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Optional keyword to filter products by name
 *     responses:
 *       200:
 *         description: Product list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: product list
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                         format: float
 *                       description:
 *                         type: string
 *                       [otherProps]:
 *                         description: Any other product properties
 *       500:
 *         description: Server error
 */

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
