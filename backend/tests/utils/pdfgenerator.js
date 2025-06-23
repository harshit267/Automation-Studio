const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generatePDFReport(sessionData, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Fonts
    doc.registerFont("Regular", "Helvetica");
    doc.registerFont("Bold", "Helvetica-Bold");

    // Title
    doc.font("Bold").fontSize(20).fillColor("#1f4e79").text("Test Session Report", { align: "center" });
    doc.moveDown(1.5);

    // Session Info Block
    doc.rect(40, doc.y, 520, 100).fill("#f0f4f7").stroke();
    doc.fillColor("#000").font("Regular").fontSize(12);
    doc.text(`Session ID: ${sessionData.sessionId}`, 50, doc.y + 10);
    doc.text(`Start Time: ${new Date(sessionData.startTime).toLocaleString()}`);
    doc.text(`Duration: ${sessionData.duration}`);
    doc.text(`Device: ${sessionData.deviceInfo?.brand} ${sessionData.deviceInfo?.model}`);
    doc.text(`Android: ${sessionData.deviceInfo?.platformVersion} (API ${sessionData.deviceInfo?.apiVersion})`);
    doc.moveDown(2);

    // Test Results Heading
    doc.font("Bold").fontSize(16).fillColor("#1a73e8").text("Test Results", { underline: true });
    doc.moveDown(1);

    sessionData.testResults.forEach((test, index) => {
      const statusColor = test.status.toLowerCase() === "passed" ? "#28a745" : "#d93025";
      const statusText = test.status.toUpperCase();

      // Test Name + Status
      doc.font("Bold").fontSize(13).fillColor("#000").text(`${index + 1}. ${test.testName}`, { continued: true });
      doc.fillColor(statusColor).text(`  [${statusText}]`);
      doc.moveDown(0.5);

      // Logs Section
      if (test.logs) {
        doc.font("Bold").fontSize(12).fillColor("#000").text("Logs:");
        drawTextBox(doc, test.logs, "#eeeeee", "#000", 8);
        doc.moveDown(1);
      }

      // Logcat Errors Section
      if (test.logcatErrors) {
        doc.font("Bold").fontSize(12).fillColor("#d93025").text("Logcat Errors:");
        drawTextBox(doc, test.logcatErrors, "#fff0f0", "#d93025", 8);
        doc.moveDown(1);
      }
    });

    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
}

// Helper to draw a gray/red box with bullet points for logs
function drawTextBox(doc, text, bgColor, textColor, fontSize) {
  const boxWidth = 500;
  const lineSpacing = 4;
  const topMargin = 45;
  const bottomMargin = 50;
  const maxBoxHeightPerPage = doc.page.height - bottomMargin - topMargin;

  const lines = (text || "None")
    .split("\n")
    .map(line =>
      line
        .trim()
        .replace(/^['"`•\-–\s]+/, "")
    )
    .filter(line => line.length > 0);

  let yOffset = doc.y;
  let boxHeight = 0;

  lines.forEach((line, i) => {
    const lineHeight = fontSize + lineSpacing;

    // Check if we need to add a new page
    if (yOffset + lineHeight > maxBoxHeightPerPage) {
      doc.addPage();
      yOffset = topMargin;
    }

    // Draw background box behind this line
    doc.rect(45, yOffset - 2, boxWidth, lineHeight + 4).fill(bgColor);
    doc.fillColor(textColor).font("Courier").fontSize(fontSize);
    doc.text(`• ${line}`, 50, yOffset, { width: boxWidth - 10 });

    yOffset += lineHeight;
  });

  // Move down after the box
  doc.moveDown(1);
}




module.exports = { generatePDFReport };
