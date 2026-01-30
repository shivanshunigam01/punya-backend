import { Router } from "express";
import { listBanners, getActiveBannerByPage, createBanner, updateBanner, deleteBanner } from "../../controllers/bannerController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { uploadProductMedia } from "../../middleware/upload.js";

const r = Router();

// Public
r.get("/:page", getActiveBannerByPage);

// master_Admin
r.get("/", requireAuth, requireRole(["master_admin","staff"]), listBanners);
r.post(
  "/",
  requireAuth,
  requireRole(["master_admin"]),
  uploadProductMedia, // 🔥 SAME PATTERN AS PRODUCTS
  createBanner
);

r.put(
  "/:id",
  requireAuth,
  requireRole(["master_admin"]),
  uploadProductMedia,
  updateBanner
);
r.delete("/:id", requireAuth, requireRole(["master_admin"]), deleteBanner);

export default r;
