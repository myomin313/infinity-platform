const express = require("express");
const router = express.Router();


const securityModel = require('../models/securityModel');

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
 * /security-services:
 *   get:
 *     summary: Get all security records
 *     tags:
 *       - security-services
 *     responses:
 *       200:
 *         description: Successfully retrieved securities
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
 *                   example: security service data
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "664352b221bfb9aaf8c408a2"
 *                       name:
 *                         type: string
 *                         example: "Gold Bond"
 *                       symbol:
 *                         type: string
 *                         example: "GLDBND"
 *                       type:
 *                         type: string
 *                         example: "Bond"
 *                       issuedDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-05-01"
 *                       maturityDate:
 *                         type: string
 *                         format: date
 *                         example: "2030-05-01"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


/**
 * @swagger
 * tags:
 *   - name: Security Services
 *     description: Security service related endpoints
 * 
 * /security-services:
 *   get:
 *     summary: Get all security service data
 *     tags: [Security Services]
 *     responses:
 *       200:
 *         description: List of security service data
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
 *                   example: security service data
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60a7d6f5f1e7c45b8c5f4a1d"
 *                       name:
 *                         type: string
 *                         example: "Firewall"
 *                       description:
 *                         type: string
 *                         example: "Provides network protection."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T12:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-02T12:00:00Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */


router.get("/", async (req, res) => {
 try {
    const securities = await securityModel.find({});  

    const response = success("security service data",
      securities
    )
      return res.json(response);
  } catch (error) {
      const response = error(error)
      return res.json(response);  
  }
});

module.exports = router;
