const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const { checkRequiredFields } = require("../commonFunctions/validate");

const {
  success,
  error,
  requiredParams,
  conflict,
  invalidEmail,
  internalError,
  notFound
} = require("../commonFunctions/response");

const multer = require('multer');
const upload = multer();

const documentsPath = path.join(__dirname, "../commonFunctions/documents.json");

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    console.error("Invalid vectors:", { a, b });
    return 0;
  }

  if (a.length !== b.length) {
    console.error(`Vector length mismatch: ${a.length} vs ${b.length}`);
    return 0;
  }

  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  
  // Handle division by zero
  if (normA === 0 || normB === 0) return 0;
  
  return dot / (normA * normB);
}

/**
 * @swagger
 * /search:
 *   post:
 *     summary: Search documents using text query and embedding similarity
 *     tags:
 *       - search
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: The search query text
 *     responses:
 *       200:
 *         description: Search results returned successfully
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
 *                   example: search result
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "doc123"
 *                       text:
 *                         type: string
 *                         example: "Sample matching document text"
 *                       url:
 *                         type: string
 *                         format: uri
 *                         example: "https://example.com/doc/123"
 *       400:
 *         description: Missing required fields (e.g., query)
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
 *                   example: "Missing required fields: query"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *                 details:
 *                   type: string
 *                   example: Detailed error message
 */


router.post("/", upload.none(), async (req, res) => {
  const { query } = req.body;

  let isRequired = checkRequiredFields(["query"], req.body);
  
  if (isRequired) {
        console.log("send required fields response");
        let response = requiredParams(isRequired);
        return res.json(response);
      }

  try {
    const { pipeline } = await import('@xenova/transformers');
    const docs = JSON.parse(fs.readFileSync(documentsPath, "utf-8"));
    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    const output = await embedder(query, { pooling: "mean", normalize: true });
    const queryEmbedding = Array.from(output.data);

    const results = docs
      .filter(doc => Array.isArray(doc.embedding) && doc.embedding.length > 0)
      .map(doc => ({
        ...doc,
        score: cosineSimilarity(doc.embedding, queryEmbedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .filter(result => result.score > 0.2)
      .map(({ id, text, url}) => ({
    id,
    text,
    url
  }));
// Add minimum similarity threshold
   const response = success("search result",results.length > 0 ? results : []);
    res.json(response);
  } catch (err) {
    //console.error("Search error:", err);
    const response = error(err.message)
    return res.json(response);
    // res.status(500).json({ 
    //   error: "Internal server error",
    //   details: err.message 
    // });
  }
});

module.exports = router;