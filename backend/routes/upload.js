const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();


const UPLOADS_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}


const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("apk"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No APK uploaded." });

  }

  const apkPath = path.join(UPLOADS_DIR, req.file.filename);
  console.log(`📂 APK uploaded: ${apkPath}`);

  res.json({ success: true, message: "✅ APK Uploaded Successfully!", apkPath });

});

module.exports = router;
