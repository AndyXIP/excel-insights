import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import multer from "multer";
import xlsx from "xlsx";
import Papa from "papaparse";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Routes
app.get("/", (req, res) => {
  res.send("Excel Insights API - Upload Excel/CSV files to /api/upload");
});

// Upload and parse Excel/CSV endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, buffer } = req.file;
    console.log(`[UPLOAD] name=${originalname} mimetype=${mimetype} size=${buffer?.length ?? 0}`);
    let parsedData = [];
    let columns = [];

    // Parse Excel files
    const lowerName = originalname.toLowerCase();
    const isExcel = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream", // some browsers send this for xlsx
    ].includes(mimetype) || lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls");

    if (isExcel) {
      try {
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames?.[0];
        if (!sheetName) throw new Error("No sheets found in workbook");
        const sheet = workbook.Sheets[sheetName];
        // Try object output using first row as headers
        let rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
        if (!Array.isArray(rows) || rows.length === 0) {
          // Fallback: read as 2D array to construct headers
          const aoa = xlsx.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
          if (!Array.isArray(aoa) || aoa.length === 0) throw new Error("Sheet is empty");
          const headerRow = aoa[0];
          const inferredCols = (headerRow && headerRow.length > 0)
            ? headerRow.map((h, i) => String(h || `Column${i + 1}`))
            : Array.from({ length: Math.max(...aoa.map(r => r.length)) || 1 }, (_, i) => `Column${i + 1}`);
          rows = aoa.slice(1).map((r) => {
            const o = {};
            inferredCols.forEach((c, i) => { o[c] = r[i] ?? ""; });
            return o;
          });
        }
        parsedData = rows;
        columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      } catch (e) {
        console.error("[PARSE-EXCEL]", e);
        return res.status(400).json({ error: "Failed to parse Excel file. Try saving as .xlsx without macros or export to CSV and retry.", details: String(e?.message || e) });
      }
    }
    // Parse CSV files
    else if (mimetype === "text/csv" || lowerName.endsWith(".csv")) {
      try {
        const csvText = buffer.toString("utf-8");
        // First attempt with header row
        let parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true, dynamicTyping: true });
        let rows = parsed.data;
        if (!Array.isArray(rows) || rows.length === 0 || Object.keys(rows[0] || {}).length === 0) {
          // Fallback: parse without header and generate generic headers
          parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true, dynamicTyping: true });
          const matrix = parsed.data;
          const maxCols = Math.max(...matrix.map((r) => r.length));
          const headers = Array.from({ length: maxCols }, (_, i) => `Column${i + 1}`);
          rows = matrix.map((r) => {
            const o = {};
            headers.forEach((h, i) => { o[h] = r[i] ?? ""; });
            return o;
          });
        }
        parsedData = rows;
        columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      } catch (e) {
        console.error("[PARSE-CSV]", e);
        return res.status(400).json({ error: "Failed to parse CSV file. Ensure it is UTF-8 encoded and not corrupted.", details: String(e?.message || e) });
      }
    } else {
      return res.status(400).json({ error: "Unsupported file type. Please upload .xlsx, .xls, or .csv files.", details: `name=${originalname} mimetype=${mimetype}` });
    }

    // Return parsed data and metadata
    res.json({
      success: true,
      filename: originalname,
      rowCount: parsedData.length,
      columns,
      data: parsedData,
    });
  } catch (error) {
    console.error("[UPLOAD] error:", error);
    res.status(500).json({ error: "Unexpected error during upload/parse", details: error?.message || String(error) });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Handle unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
