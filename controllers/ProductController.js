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
} = require("../commonFunctions/response");
const authenticateToken = require('../commonFunctions/authenticateToken');


/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product listing and search endpoints
 * 
 * /product:
 *   get:
 *     summary: Retrieve a list of products, optionally filtered by search term
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Optional search term to filter products by name (case-insensitive)
 *         required: false
 *         schema:
 *           type: string
 *           example: "laptop"
 *     responses:
 *       200:
 *         description: List of products matching the search criteria
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
 *                       id:
 *                         type: string
 *                         example: "123"
 *                       name:
 *                         type: string
 *                         example: "Gaming Laptop"
 *                       price:
 *                         type: number
 *                         example: 1499.99
 *                       description:
 *                         type: string
 *                         example: "High performance gaming laptop"
 */
router.get("/",authenticateToken,(req, res) => {
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
