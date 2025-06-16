const express = require("express");
const router = express.Router();
const path = require('path');


const serviceModel = require('../models/serviceModel');

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
 * /service:
 *   get:
 *     summary: Retrieve all services
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved services
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
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64aaf3fbbd1234567890abcd"
 *                       name:
 *                         type: string
 *                         example: "Consulting Service"
 *                       description:
 *                         type: string
 *                         example: "Provides expert consulting."
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



router.get("/", authenticateToken,async (req, res) => {
 try {
    const services = await serviceModel.find({});  
    const  response = success("success",services)
      return res.json(response);
  } catch (err) {
    console.log("ddt");
   const response = error(err.message)
      return res.json(response);  
  }
});

/**
 * @swagger
 * /service/download:
 *   get:
 *     summary: Download the service PDF file
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service PDF file downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: File not found or unable to download
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File not found or unable to download.
 */


router.get("/download",authenticateToken, async (req, res) => {
  const filePath = path.join(__dirname, '../commonFunctions', 'service.pdf');

  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ message: "File not found or unable to download." });
    }
  });
  
});

module.exports = router;
