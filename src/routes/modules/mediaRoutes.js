import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  uploadSingle,
  uploadMultiple,
  listMedia,
  deleteMedia,
} from "../../controllers/mediaController.js";

const r = Router();

const tmpDir = "uploads/tmp";
fs.mkdirSync(tmpDir, { recursive: true });

const sanitizeFolder = (value = "general") =>
  String(value)
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9/_-]/g, "-")
    .replaceAll(/\/+/g, "/")
    .replaceAll(/^-|-$/g, "");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replaceAll(/\s+/g, "-")
      .replaceAll(/[^\w-]/g, "")
      .slice(0, 80);

    cb(null, `${Date.now()}-${base || "upload"}${ext.toLowerCase()}`);
  },
});

const mapFileToLocalUrl = (folder, file) => {
  const safeFolder = sanitizeFolder(folder || "general");
  const targetDir = path.join("uploads", "media", ...safeFolder.split("/"));
  fs.mkdirSync(targetDir, { recursive: true });

  const targetPath = path.join(targetDir, file.filename);
  fs.renameSync(file.path, targetPath);

  return `/uploads/media/${safeFolder}/${file.filename}`.replaceAll("\\", "/");
};

const finalizeUploads = (req, res, next) => {
  const folder = req.body.folder || "general";

  if (req.file) {
    req.file.path = mapFileToLocalUrl(folder, req.file);
  }

  if (Array.isArray(req.files)) {
    req.files = req.files.map((file) => ({
      ...file,
      path: mapFileToLocalUrl(folder, file),
    }));
  }

  next();
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "application/pdf",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type"), false);
    }

    cb(null, true);
  },
});

/**
 * Routes (master_Admin / Staff only)
 */
r.post(
  "/upload",
  requireAuth,
  requireRole(["master_admin", "staff"]),
  upload.single("file"),
  finalizeUploads,
  uploadSingle
);

r.post(
  "/upload-multiple",
  requireAuth,
  requireRole(["master_admin", "staff"]),
  upload.array("files", 10),
  finalizeUploads,
  uploadMultiple
);

r.get("/", requireAuth, requireRole(["master_admin", "staff"]), listMedia);

r.delete("/:id", requireAuth, requireRole(["master_admin", "staff"]), deleteMedia);

export default r;
