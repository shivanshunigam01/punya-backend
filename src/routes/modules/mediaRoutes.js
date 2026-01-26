import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../../config/cloudinary.js"; // ✅ IMPORT INSTANCE
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  uploadSingle,
  uploadMultiple,
  listMedia,
  deleteMedia,
} from "../../controllers/mediaController.js";

const r = Router();

/**
 * Cloudinary Storage
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = req.body.folder || "patliputra/general";
    const isVideo = file.mimetype.startsWith("video/");

    return {
      folder,
      resource_type: isVideo ? "video" : "image",
      public_id: `${Date.now()}-${file.originalname
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]/g, "")}`.slice(0, 120),
    };
  },
});

/**
 * Multer config
 */
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
 * Routes (Admin / Staff only)
 */
r.post(
  "/upload",
  requireAuth,
  requireRole(["admin", "staff"]),
  upload.single("file"),
  uploadSingle
);

r.post(
  "/upload-multiple",
  requireAuth,
  requireRole(["admin", "staff"]),
  upload.array("files", 10),
  uploadMultiple
);

r.get("/", requireAuth, requireRole(["admin", "staff"]), listMedia);

r.delete("/:id", requireAuth, requireRole(["admin", "staff"]), deleteMedia);

export default r;
