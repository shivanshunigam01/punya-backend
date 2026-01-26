import { Router } from "express";
import { listBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand } from "../../controllers/brandController.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const r = Router();

// Public
r.get("/", listBrands);
r.get("/:slug", getBrandBySlug);

// Admin
r.post("/", requireAuth, requireRole(["admin"]), createBrand);
r.put("/:id", requireAuth, requireRole(["admin"]), updateBrand);
r.delete("/:id", requireAuth, requireRole(["admin"]), deleteBrand);

export default r;
