const express = require("express");
const fs = require("fs");
const path = require("path");
const {getConnectedDeviceModal,getDeviceInfoViaADB,} = require("../config/devicesutils")

const router = express.Router();

router.get("/", (req, res) => {
  const testDir = path.join(__dirname, "../tests/binogi/testcases");
  const testCases = [];


  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith(".js")) {
        const relativePath = path.relative(path.join(__dirname, ".."), fullPath);
        const name = file
          .replace(".js", "")
          .replace(/([A-Z])/g, " $1")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        testCases.push({
          name: name.trim(),
          script: relativePath.replace(/\\/g, "/"),
        });
      }
    });
  }

  try {
    const deviceInfo =  getDeviceInfoViaADB();
    walk(testDir);
    res.json({ success: true, testCases , deviceInfo });
  } catch (err) {
    console.error("Error reading test cases:", err);
    res.status(500).json({ success: false, error: "Failed to read test cases" });
  }
});


module.exports = router;
