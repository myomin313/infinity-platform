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
; // Add minimum similarity threshold
   const response = success("search result",results.length > 0 ? results : []);
    res.json(response);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
});

module.exports = router;