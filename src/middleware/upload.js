// src/middleware/upload.js
import multer from "multer";
import fs from "fs";
import path from "path";

/* ===============================
   ENSURE DIRECTORIES
================================ */
const tempDir = "uploads/tmp";
const brochureDir = "uploads/brochures";

fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(brochureDir, { recursive: true });

/* ===============================
   SINGLE STORAGE (TEMP)
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // everything first goes to temp
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/* ===============================
   MULTER (ACCEPT BOTH)
================================ */
export const uploadProductMedia = multer({
  storage,
  limits: {
    files: 11, // 10 images + 1 brochure
  },
}).fields([
  { name: "images", maxCount: 10 },
  { name: "brochure", maxCount: 1 },
   { name: "inspectionReport", maxCount: 1 },
]);

export default uploadProductMedia;