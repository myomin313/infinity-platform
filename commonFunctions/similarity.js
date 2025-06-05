function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(vec) {
  return Math.sqrt(dotProduct(vec, vec));
}

function cosineSimilarity(a, b) {
  return dotProduct(a, b) / (magnitude(a) * magnitude(b));
}

module.exports = { cosineSimilarity };
