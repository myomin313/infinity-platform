// import fs from 'fs';
// import path from 'path';
// import { pipeline } from '@xenova/transformers';
// import { fileURLToPath } from 'url';

// // Get __dirname equivalent in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// async function main() {
//   const file = path.join(__dirname, "commonFunctions/documents.json");
//   const docs = JSON.parse(fs.readFileSync(file, "utf-8"));
  
//   try {
//     console.log("Loading embedding model...");
//     const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

//     for (const doc of docs) {
//       console.log(`Generating embedding for: ${doc.title}`);
//       const text = `${doc.title} ${doc.description}`;
//       const output = await embedder(text, {
//         pooling: "mean",
//         normalize: true
//       });
//       doc.embedding = Array.from(output.data);
//     }

//     fs.writeFileSync(file, JSON.stringify(docs, null, 2));
//     console.log("✅ Embeddings generated successfully.");
//   } catch (err) {
//     console.error("❌ Error generating embeddings:", err);
//     process.exit(1);
//   }
// }

// main();


import fs from 'fs';
import path from 'path';
import { pipeline } from '@xenova/transformers';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateEmbeddings() {
  const file = path.join(__dirname, "commonFunctions/documents.json");
  const docs = JSON.parse(fs.readFileSync(file, "utf-8"));
  
  try {
    console.log("Loading embedding model...");
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    // Process documents sequentially to avoid memory issues
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      console.log(`Processing document ${i+1}/${docs.length}: ${doc.title}`);
      
      try {
        // Generate embedding using both title and description
        const text = `${doc.text}`;
        const output = await extractor(text, {
          pooling: 'mean',
          normalize: true
        });
        
        // Properly extract the embedding data
        doc.embedding = Array.from(output.data);
        console.log(`Generated embedding with ${doc.embedding.length} dimensions`);
      } catch (err) {
        console.error(`Error processing document ${doc.id}:`, err);
        doc.embedding = []; // Mark as failed
      }
    }

    // Write the updated documents back to the file
    fs.writeFileSync(file, JSON.stringify(docs, null, 2));
    console.log("✅ Successfully generated embeddings for all documents");
  } catch (err) {
    console.error("❌ Failed to generate embeddings:", err);
    process.exit(1);
  }
}

generateEmbeddings();