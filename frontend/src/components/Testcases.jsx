import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from "../styles/testcases.module.css";
import Select from "react-select";
import { saveAs } from "file-saver";


const backendUrl = "http://localhost:4000";


export default function TestCases() {
  const [testCases, setTestCases] = useState([]);
  const [selected, setSelected] = useState([]);
  const [logs, setLogs] = useState("");
  const [ws, setWs] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const wsBuffer = useRef([]);
  const stopped = useRef(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [deviceName, setDeviceName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceAndroidId, setDeviceAndroidId] = useState("");
  const [deviceplatformVersion, setDeviceplatformVersion] = useState("");
  const [deviceapiVersion, setDeviceapiVersion] = useState("");
  const [devicelocale, setDevicelocale] = useState("");
  const [devicedisplayDensity, setDevicedisplayDensity] = useState("");
  const [devicescreenSize, setDevicescreenSize] = useState("");
  const [deviceID, setDeviceID] = useState("");

  let deviceInfoBlock = null;



  useEffect(() => {
    axios.get(`${backendUrl}/api/testcases`).then((res) => {
      setTestCases(res.data.testCases);
      const device = res.data.deviceInfo;
    if (device) {
      setDeviceModel(device.model);
      setDeviceName(device.brand);
      setDeviceID(device.deviceId); 
      setDeviceAndroidId(device.androidID);
      setDeviceplatformVersion(device.platformVersion);
      setDeviceapiVersion(device.apiVersion);
      setDevicelocale(device.locale);
      setDevicedisplayDensity(device.displayDensity);
      setDevicescreenSize(device.screenSize);
    }
    });

    const socket = new WebSocket(`ws://localhost:4000`);
    socket.onmessage = (e) => {
      setLogs((prev) => prev + "\n" + e.data);
      if (e.data.includes("✅ Test finished") || e.data.includes("⛔ Test stopped by user.")) {
        wsBuffer.current.push("done");
      }
    };

    socket.onerror = () => setLogs((prev) => prev + "\n❌ WebSocket error");
    socket.onclose = () => setLogs((prev) => prev + "\n🔌 WebSocket closed");
    setWs(socket);
    return () => socket.close();
  }, []);

  const downloadPDF = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/test/history/${encodeURIComponent(currentSessionId)}/pdf`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      saveAs(blob, `${currentSessionId}.pdf`);
    } catch (err) {
      alert("❌ Failed to download PDF: " + err.message);
      console.error("Download error", err);
    }
  };


  const runTests = async () => {
    if (selected.length === 0) return alert("Select at least 1 test");

    const sessionId = generateReadableSessionId();
    setCurrentSessionId(sessionId);
    await axios.post(`${backendUrl}/test/start-session`, { sessionId });

    setLogs("");
    setIsRunning(true);
    stopped.current = false;

    for (const script of selected) {
      if (stopped.current) {
        setLogs((prev) => prev + "\n⛔ Test execution stopped by user.");
        break;
      }

      setLogs((prev) => prev + `\n▶ Starting test: ${script}`);
      wsBuffer.current = [];

      const lastTestInLoop = script === selected[selected.length - 1];

      await axios.post(`${backendUrl}/test/start`, {
        script,
        sessionId,
        lastTestInLoop: script === selected[selected.length - 1]
      });


      await waitForTestEnd();
    }

    setIsRunning(false);
    setLogs((prev) => prev + "\n✅ All tests finished!");
  };


  const waitForTestEnd = () => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (wsBuffer.current.includes("done") || stopped.current) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });
  };

  const stopTest = () => {
    axios.post(`${backendUrl}/test/stop`).then((res) => {
      setLogs((prev) => prev + "\n" + res.data.message);
    });
    stopped.current = true;
  };

  const clearLogs = () => {
    setLogs("");
  };
  const generateReadableSessionId = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());

    let hours = now.getHours();
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedTime = `${pad(hours)}-${minutes}-${seconds}-${ampm}`;
    return `session-${year}-${month}-${day}_${formattedTime}`;
  };



  const testCaseOptions = testCases.map(test => ({
    value: test.script,
    label: test.name
  }));



  if (deviceName && deviceModel) {
    deviceInfoBlock = (
      <div className="apk-info">
        <p><strong>Device Name:</strong> {deviceName}</p>
        <p><strong>Device Model:</strong> {deviceModel}</p>
        <p><strong>Device ID:</strong> {deviceID}</p>
        <p><strong>Android ID:</strong> {deviceAndroidId}</p>
        <p><strong>Platform Version:</strong> {deviceplatformVersion}</p>
        <p><strong>API Version:</strong> {deviceapiVersion}</p>
        <p><strong>Locale:</strong> {devicelocale}</p>
        <p><strong>Display Density:</strong> {devicedisplayDensity}</p>
        <p><strong>Screen Size:</strong> {devicescreenSize}</p>
      </div>
    );
  } else if (!deviceName) {
    deviceInfoBlock = (
      <p style={{ color: "red", paddingLeft: "10%" }}>No Device is Connected Please connect one device first and reload the page</p>

    );

  }


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/" className={styles.backButton}>⬅ Back to Home</Link>
        <h2 className={styles.heading}>🧪 Test Case Manager</h2>
      </div>

      {deviceInfoBlock}

      <div className={styles.layout}>
        <div className={styles.selector}>
          <h3>Select Test Cases</h3>

          <Select
            isMulti
            options={testCaseOptions}
            value={testCaseOptions.filter(opt => selected.includes(opt.value))}
            onChange={(selectedOptions) => setSelected(selectedOptions.map(opt => opt.value))}
          />

          <div className={styles.buttons}>
            <button onClick={runTests} disabled={isRunning} className={styles.runBtn}>▶ Run Selected</button>
            <button onClick={stopTest} disabled={!isRunning} className={styles.stopBtn}>⛔ Stop Test</button>
          </div>
        </div>

        <div className={styles.logs}>
          <div className={styles.logsHeader}>
            📜 Live Logs
            <button onClick={clearLogs} className={styles.clearBtn}>🧹 Clear</button>

          </div>
          <pre className={styles.logsBox}>{logs}</pre>
          {currentSessionId && !isRunning && (
            <button
              onClick={downloadPDF}
              className={styles.downloadBtn}
            >
              📄 Download PDF Report
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
