const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const isProduction = process.env.NODE_ENV === "production";


const UPLOADS_DIR = isProduction
  ? path.join(process.resourcesPath, "uploads")
  : path.join(__dirname, "../uploads");

function getADBPath() {
  const platform = os.platform();

  const basePath = isProduction
    ? process.resourcesPath
    : path.join(__dirname, "../../electron");

  let adbPath;

  if (platform === "win32") {
    adbPath = path.join(basePath, "bin", "win", "platform-tools", "adb.exe");
  } else if (platform === "darwin") {
    adbPath = path.join(basePath, "bin", "mac", "platform-tools", "adb");
  } else if (platform === "linux") {
    adbPath = path.join(basePath, "bin", "linux", "platform-tools", "adb");
  } else {
    throw new Error("❌ Unsupported platform for ADB");
  }

  return adbPath;
}

function getLatestAPK() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error("❌ Uploads directory not found:", UPLOADS_DIR);
    return null;
  }

  const files = fs
    .readdirSync(UPLOADS_DIR)
    .filter((file) => file.endsWith(".apk"))
    .map((file) => {
      const filePath = path.join(UPLOADS_DIR, file);
      const time = fs.statSync(filePath).mtime.getTime();
      return { file, time };
    })
    .sort((a, b) => b.time - a.time);

  if (files.length === 0) {
    console.warn("⚠️ No APK files found in uploads directory");
    return null;
  }

  const latest = path.join(UPLOADS_DIR, files[0].file);
  return latest;
}

function getConnectedDevice() {
  try {
    const adbPath = getADBPath();
    const output = execSync(`"${adbPath}" devices`).toString();
    const lines = output.split("\n").filter((line) => line.includes("\tdevice"));

    if (lines.length === 0) throw new Error("❌ No Android device connected");

    const deviceId = lines[0].split("\t")[0];
    console.log("✅ Connected device ID:", deviceId);
    return deviceId;
  } catch (err) {
    console.error("❌ Failed to get connected device:", err.message);
    return err.message;
  }
}

function saveDeviceInfoToJSON(info) {
  const filePath = path.join(__dirname, "../data/deviceDetails.json");

  let existing = [];
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      existing = JSON.parse(raw);
    } catch (err) {
      console.warn("⚠️ Failed to parse existing device info. Overwriting...");
    }
  }


  const alreadyExists = existing.find(
    (e) => e.androidId === info.androidId || e.deviceId === info.deviceId
  );

  if (!alreadyExists) {
    existing.push(info);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  } else {
    console.log("Device info already exists, skipping save.");
  }
}


function getDeviceInfoViaADB() {
  try {
    const adbPath = getADBPath();
    const deviceId = getConnectedDevice();
    if (!deviceId) throw new Error("No device connected");

    const props = execSync(`"${adbPath}" -s ${deviceId} shell getprop`).toString();

    const parseProp = (key) => {
      const line = props.split("\n").find(line => line.includes(`[${key}]`));
      return line ? line.split("]: [")[1]?.replace("]", "") : null;
    };

    return {
      brand: parseProp("ro.product.brand"),
      model: parseProp("ro.product.model"),
      deviceID: deviceId,
      androidId: execSync(`"${adbPath}" -s ${deviceId} shell settings get secure android_id`).toString().trim(),
      platformVersion: parseProp("ro.build.version.release"),
      apiVersion: parseProp("ro.build.version.sdk"),
      locale: parseProp("persist.sys.locale") || parseProp("ro.product.locale"),
      displayDensity: parseInt(execSync(`"${adbPath}" -s ${deviceId} shell wm density`).toString().match(/\d+/)?.[0]),
      screenSize: execSync(`"${adbPath}" -s ${deviceId} shell wm size`).toString().trim().split(": ")[1],
      timeZone: execSync(`"${adbPath}" -s ${deviceId} shell getprop persist.sys.timezone`).toString().trim(),
    };
  } catch (err) {
    console.error("❌ Failed to fetch device info via ADB:", err.message);
    return null;
  }
}

function getConnectedDeviceModal() {
  try {
    const adbPath = getADBPath();
    const output = execSync(`"${adbPath}" devices`).toString();
    const lines = output.split("\n").filter((line) => line.includes("\tdevice"));

    if (lines.length === 0) throw new Error("❌ No Android device connected");

    const deviceId = lines[0].split("\t")[0];
    console.log("✅ Connected device ID:", deviceId);

    const devicesFile = path.join(__dirname, "../data/devices.json");
    let devices = [];

    if (fs.existsSync(devicesFile)) {
      const data = fs.readFileSync(devicesFile, "utf-8");
      devices = JSON.parse(data);
    }

    const matchedDevice = devices.find((d) => d.ID === deviceId);
    const model = matchedDevice ? matchedDevice.name : "Unknown Model";

    return { deviceId, model };
  } catch (err) {
    console.error("❌ Failed to get connected device:", err.message);
    return { error: err.message };
  }
}

function captureAndSaveDeviceInfo(customName, deviceId, callback) {
  const info = getDeviceInfoViaADB(); // Should return parsed object

  if (!info) {
    console.error("❌ Unable to capture device info.");
    return callback({ status: 500, message: 'Device info capture failed' });
  }

  const deviceInfoToSave = {
    ...info,
    deviceId,
    customName
  };

  const filePath = path.join(__dirname, '../data/devices.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback({ status: 500, message: 'Read failed' });

    let json = [];
    try {
      json = JSON.parse(data);
    } catch (e) {
      return callback({ status: 500, message: 'Invalid JSON format' });
    }

    const alreadyExists = json.some(item => item.deviceId === deviceId);
    if (alreadyExists) {
      return callback({ status: 409, message: 'Device already exists' });
    }

    json.push(deviceInfoToSave);

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return callback({ status: 500, message: 'Write failed' });

      return callback(null, { status: 200, message: 'Device saved successfully', data: deviceInfoToSave });
    });
  });
}


module.exports = {
  getConnectedDevice,
  getLatestAPK,
  getDeviceInfoViaADB,
  getADBPath,
  getConnectedDeviceModal,
  captureAndSaveDeviceInfo,

};
