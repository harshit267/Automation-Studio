const express = require("express");
const {
  getConnectedDevice,
  captureAndSaveDeviceInfo,
  getDeviceInfoViaADB,
} = require("../config/devicesutils");
const fs = require("fs");
const path = require("path");

const router = express.Router();


router.post('/get-devices', async (req, res) => {
  try {
    const device = await getConnectedDevice(); // Ensure it's async if necessary
    if (!device) {
      return res.status(204).json({ message: "No device connected" });
    }

    return res.status(200).json({ device });
  } catch (error) {
    console.error("Error getting device:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/add', (req, res) => {
  const newEntry = req.body.newEntry;

  if (!newEntry || !newEntry.name || !newEntry.ID) {
    return res.status(400).json({ error: 'Missing name or ID' });
  }

  captureAndSaveDeviceInfo(newEntry.name, newEntry.ID, (err, result) => {
    if (err) return res.status(err.status).json({ error: err.message });

    res.status(result.status).json(result);
  });
});

module.exports = router;
