import { Router } from "express";
import { listBanners, getActiveBannerByPage, createBanner, updateBanner, deleteBanner } from "../../controllers/bannerController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

// Public
r.get("/:page", getActiveBannerByPage);

// Admin
r.get("/", requireAuth, requireRole(["admin","staff"]), listBanners);
r.post("/", requireAuth, requireRole(["admin"]), createBanner);
r.put("/:id", requireAuth, requireRole(["admin"]), updateBanner);
r.delete("/:id", requireAuth, requireRole(["admin"]), deleteBanner);

export default r;
