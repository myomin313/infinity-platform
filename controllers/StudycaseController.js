const express = require("express");
const router = express.Router();
const path = require('path');
const multer = require("multer");


const serviceModel = require('../models/serviceModel');

const {
  success,
  error,
  requiredParams,
  conflict,
  invalidEmail,
  internalError,
  notFound
} = require("../commonFunctions/response")

const studyCaseModel = require('../models/studyCaseModel');

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/", // store in /uploads
  filename: (req, file, cb) => {
    cb(null, `report-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });


router.post("/create", upload.single("file"), async (req, res) => {
  try {
    const { title, tags } = req.body;
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const newcase = new studyCaseModel({
      title,
      tags: tags?.split(",").map(tag => tag.trim()),
      fileUrl,
    });

    await newcase.save();
    res.json({ success: true, data: newcase });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const reports = await studyCaseModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/download', async (req, res) => {
  const fileUrl = req.query.url;

  if (!fileUrl) {
    return res.status(400).json({ error: "Missing file URL" });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
    });

    // Extract file name from URL
    const fileName = fileUrl.split('/').pop();

    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', response.headers['content-type']);

    // Pipe the file stream to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Download error:', error.message);
    res.status(500).json({ error: 'Failed to download file' });
  }
});


// router.get("/download", async (req, res) => {
//   //const { search, category } = req.query;
//   const fileName = req.params.filename;
//   const filePath = path.join(__dirname, '../commonFunctions', 'service.pdf');

//   res.download(filePath, (err) => {
//     if (err) {
//       console.error("Download error:", err);
//       res.status(500).json({ message: "File not found or unable to download." });
//     }
//   });
  
// });



// router.get("/search", async (req, res) => {
//   try {
//     const { title, tag } = req.query;

//     const filter = {
//       ...(title && { title: new RegExp(q, "i") }),
//       ...(tag && { tags: tag }),
//     };

//     const results = await studyCaseModel.find(filter).sort({ createdAt: -1 });
//     res.json({ success: true, data: results });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });





module.exports = router;
